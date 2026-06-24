"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { clearFeaturedMenu as clearFeaturedMenuService } from "@bespoke/api/menus/featured/clearFeaturedMenu.service";

export async function clearFeaturedMenu() {
	const auth = await authOrForbidden();
	return clearFeaturedMenuService(auth);
}
