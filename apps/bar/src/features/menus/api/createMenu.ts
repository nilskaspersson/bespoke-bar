"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { createMenu as createMenuService } from "@bespoke/api/menus/createMenu.service";
import type { Menu, MenuFormData } from "@bespoke/schema/schema/menus";

export async function createMenu(userInputMenu: MenuFormData): Promise<Menu> {
	const auth = await authOrForbidden();
	return createMenuService(auth, userInputMenu);
}
