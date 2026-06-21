import {
	insertMenuSchema,
	type Menu,
	type MenuFormData,
	MenusTable,
} from "@bespoke/schema/schema/menus";
import { db } from "@/db";
import { generateDefaultMenuName } from "@/features/menus/utils";
import { rateLimit } from "@/rateLimit";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

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
