"use server";

import type { RecipeList } from "@/db/schema/recipeLists";
import { setFeaturedList as setFeaturedListService } from "@/features/lists/featured/api/setFeaturedList.service";
import { authOrForbidden } from "@/utils/auth";

export async function setFeaturedList(listId: RecipeList["id"]) {
	const auth = await authOrForbidden();
	return setFeaturedListService(auth, listId);
}
