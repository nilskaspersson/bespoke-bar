import { db } from "@bespoke/db";
import {
	type Menu,
	MenusTable,
	type UpdateMenu,
} from "@bespoke/schema/schema/menus";
import { and, eq, sql } from "drizzle-orm";
import type { Auth } from "../auth";
import { cacheEvents } from "../cache";
import { rateLimit } from "../rateLimit";

/**
 * Updates a menu's own fields only. Deliberately never touches its entries —
 * the detail page curates those inline, so the editor drawer is metadata-only.
 */
export async function updateMenu(
	auth: Auth,
	menuId: Menu["id"],
	data: Pick<UpdateMenu, "name" | "description">,
): Promise<Menu> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	const [menu] = await db
		.update(MenusTable)
		.set({
			name: data.name,
			description: data.description ?? null,
			updatedAt: sql`NOW()`,
			updatedBy: userId,
		})
		.where(and(eq(MenusTable.id, menuId), eq(MenusTable.orgId, orgId)))
		.returning();

	if (!menu) {
		throw new Error("Menu not found");
	}

	cacheEvents.menu.update.emit(orgId, menu.id);

	return menu;
}
