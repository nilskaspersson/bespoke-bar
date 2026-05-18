import { and, eq, max, sql } from "drizzle-orm";
import { db } from "@/db";
import {
	type InsertMenuEntry,
	insertMenuEntrySchema,
	MenuEntriesTable,
	type MenuEntry,
	type MenuEntryFormData,
} from "@/db/schema/menuEntries";
import { MenusTable } from "@/db/schema/menus";
import { rateLimit } from "@/rateLimit";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function addRecipeToMenu(
	auth: Auth,
	userInput: MenuEntryFormData,
): Promise<MenuEntry> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	/**
	 * Validate early to avoid querying the menu. We will validate again later once we
	 * have a sort order.
	 */
	const validatedInput: InsertMenuEntry = insertMenuEntrySchema.parse({
		menuId: userInput.menuId,
		recipeId: userInput.recipeId,
		orgId,
		price: userInput.price ?? null,
	});

	const [menu] = await db
		.select({
			id: MenusTable.id,
			existingEntryId: MenuEntriesTable.id,
		})
		.from(MenusTable)
		.leftJoin(
			MenuEntriesTable,
			and(
				eq(MenuEntriesTable.menuId, MenusTable.id),
				eq(MenuEntriesTable.recipeId, validatedInput.recipeId),
			),
		)
		.where(
			and(
				eq(MenusTable.id, validatedInput.menuId),
				eq(MenusTable.orgId, orgId),
			),
		);

	if (!menu) {
		throw new Error("Menu not found or access denied");
	}

	if (menu.existingEntryId) {
		throw new Error("Recipe is already in menu");
	}

	/**
	 * Find largest current sort order
	 */
	const [{ maxSortOrder }] = await db
		.select({ maxSortOrder: max(MenuEntriesTable.sortOrder) })
		.from(MenuEntriesTable)
		.where(eq(MenuEntriesTable.menuId, validatedInput.menuId));

	const validatedEntry: InsertMenuEntry = insertMenuEntrySchema.parse({
		...validatedInput,
		sortOrder: (maxSortOrder ?? 0) + 1,
	});

	const entry = await db.transaction(async (tx) => {
		const [newEntry] = await tx
			.insert(MenuEntriesTable)
			.values(validatedEntry)
			.returning();

		await tx
			.update(MenusTable)
			.set({ updatedAt: sql`NOW()` })
			.where(and(eq(MenusTable.id, menu.id), eq(MenusTable.orgId, orgId)));

		return newEntry;
	});

	cacheEvents.menu.update.emit(orgId, menu.id);

	return entry;
}
