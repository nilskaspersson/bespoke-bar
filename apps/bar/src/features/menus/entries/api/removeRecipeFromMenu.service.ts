import { db } from "@bespoke/db";
import {
	MenuEntriesTable,
	type MenuEntry,
} from "@bespoke/schema/schema/menuEntries";
import { MenusTable } from "@bespoke/schema/schema/menus";
import { and, eq, sql } from "drizzle-orm";
import { rateLimit } from "@/rateLimit";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function removeRecipeFromMenu(
	auth: Auth,
	entryId: string,
): Promise<MenuEntry> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	const deletedEntry = await db.transaction(async (tx) => {
		const [entry] = await tx
			.delete(MenuEntriesTable)
			.where(
				and(
					eq(MenuEntriesTable.id, entryId),
					eq(MenuEntriesTable.orgId, orgId),
				),
			)
			.returning();

		if (!entry) {
			throw new Error("Recipe not found, or access denied");
		}

		await tx
			.update(MenusTable)
			.set({ updatedAt: sql`NOW()` })
			.where(and(eq(MenusTable.id, entry.menuId), eq(MenusTable.orgId, orgId)));

		return entry;
	});

	cacheEvents.menu.update.emit(orgId, deletedEntry.menuId);

	return deletedEntry;
}
