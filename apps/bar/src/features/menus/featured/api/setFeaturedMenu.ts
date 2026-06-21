"use server";

import type { Menu } from "@bespoke/schema/schema/menus";
import { setFeaturedMenu as setFeaturedMenuService } from "@/features/menus/featured/api/setFeaturedMenu.service";
import { authOrForbidden } from "@/utils/auth";

export async function setFeaturedMenu(menuId: Menu["id"]) {
	const auth = await authOrForbidden();
	return setFeaturedMenuService(auth, menuId);
}
