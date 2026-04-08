"use server";

import { clearFeaturedList as clearFeaturedListService } from "@/features/lists/featured/api/clearFeaturedList.service";
import { authOrForbidden } from "@/utils/auth";

export async function clearFeaturedList() {
	const auth = await authOrForbidden();
	return clearFeaturedListService(auth);
}
