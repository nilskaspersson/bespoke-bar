"use server";

import { clearFeaturedMenu as clearFeaturedMenuService } from "@/features/menus/featured/api/clearFeaturedMenu.service";
import { authOrForbidden } from "@/utils/auth";

export async function clearFeaturedMenu() {
	const auth = await authOrForbidden();
	return clearFeaturedMenuService(auth);
}
