import type { MenuWithEntriesFormData } from "@bespoke/schema/schema/composite";
import {
	type InsertMenuEntry,
	insertMenuEntrySchema,
	MenuEntriesTable,
	type MenuEntry,
} from "@bespoke/schema/schema/menuEntries";
import { type Menu, MenusTable } from "@bespoke/schema/schema/menus";
import { and, eq, sql } from "drizzle-orm";
import type { DatabaseTransaction } from "@/db";
import { generateDefaultMenuName } from "@/features/menus/utils";

export async function upsertMenuInTransaction(
	tx: DatabaseTransaction,
	menuData: MenuWithEntriesFormData["menu"],
	userId: string,
	orgId: string,
): Promise<[Menu, boolean]> {
	/**
	 * Update existing menu if it has an ID
	 */
	if (menuData.id) {
		const [updatedMenu] = await tx
			.update(MenusTable)
			.set({
				...menuData,
				updatedAt: sql`NOW()`,
				updatedBy: userId,
			})
			.where(and(eq(MenusTable.id, menuData.id), eq(MenusTable.orgId, orgId)))
			.returning();

		if (!updatedMenu) {
			throw new Error("Menu not found or access denied");
		}

		return [updatedMenu, false];
	}

	const [newMenu] = await tx
		.insert(MenusTable)
		.values({
			...menuData,
			name: menuData.name || generateDefaultMenuName(),
			orgId,
			createdBy: userId,
		})
		.returning();

	return [newMenu, true];
}

/**
 * Replace all entries in a menu (delete existing, insert new).
 */
export async function replaceMenuEntriesInTransaction(
	tx: DatabaseTransaction,
	menuId: string,
	entries: MenuWithEntriesFormData["entries"],
	orgId: string,
): Promise<void> {
	/**
	 * Delete all existing entries
	 */
	await tx
		.delete(MenuEntriesTable)
		.where(
			and(
				eq(MenuEntriesTable.orgId, orgId),
				eq(MenuEntriesTable.menuId, menuId),
			),
		);

	/**
	 * Insert all provided entries
	 */
	if (entries.length > 0) {
		const entriesToInsert: InsertMenuEntry[] = entries.map((entry, index) => ({
			menuId,
			recipeId: entry.recipeId,
			price: entry.price,
			sortOrder: entry.sortOrder ?? index,
			orgId,
		}));

		const validatedEntries = insertMenuEntrySchema
			.array()
			.parse(entriesToInsert);

		await tx.insert(MenuEntriesTable).values(validatedEntries);
	}
}

export async function appendMenuEntriesInTransaction(
	tx: DatabaseTransaction,
	menuId: string,
	entries: MenuWithEntriesFormData["entries"],
	orgId: string,
): Promise<MenuEntry[]> {
	if (entries.length === 0) {
		return [];
	}

	const entriesToInsert: InsertMenuEntry[] = entries.map((entry) => ({
		menuId,
		recipeId: entry.recipeId,
		price: entry.price,
		sortOrder: entry.sortOrder ?? 0,
		orgId,
	}));

	const validatedEntries = insertMenuEntrySchema.array().parse(entriesToInsert);

	return await tx
		.insert(MenuEntriesTable)
		.values(validatedEntries)
		.onConflictDoNothing()
		.returning();
}
