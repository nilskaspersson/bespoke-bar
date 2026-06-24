import { db } from "@bespoke/db";
import {
	insertMenuSchema,
	type Menu,
	type MenuFormData,
	MenusTable,
} from "@bespoke/schema/schema/menus";
import type { Auth } from "../auth";
import { cacheEvents } from "../cache";
import { rateLimit } from "../rateLimit";
import { generateDefaultMenuName } from "./generateDefaultMenuName";

export async function createMenu(
	auth: Auth,
	userInputMenu: MenuFormData,
): Promise<Menu> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	/**
	 * Use a timestamp as a fallback name
	 * TODO: Move to implementation point for local formatting + schema validation?
	 */
	const name = userInputMenu?.name || generateDefaultMenuName();

	const validatedMenu = insertMenuSchema.parse({
		...userInputMenu,
		name,
		orgId,
		createdBy: userId,
	});

	const [menu] = await db.insert(MenusTable).values(validatedMenu).returning();

	cacheEvents.menu.create.emit(orgId);

	return menu;
}
