"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { setFeaturedMenu as setFeaturedMenuService } from "@bespoke/api/menus/featured/setFeaturedMenu.service";
import type { Menu } from "@bespoke/schema/schema/menus";

export async function setFeaturedMenu(menuId: Menu["id"]) {
	const auth = await authOrForbidden();
	return setFeaturedMenuService(auth, menuId);
}
