import { revalidatePath } from "next/cache";
import type { Recipe } from "@/db/schema/recipes";

export function revalidateRecipePaths(ids: Recipe["id"][]) {
	revalidatePath("/bar/recipes", "page");

	ids.forEach((id) => {
		revalidatePath(`/bar/recipes/${id}`, "layout");
	});
}

export function getRecipesCacheTag(orgId: string): string {
	return `org:${orgId}:recipes`;
}

export function getRecipeIdCacheTag(orgId: string, id: string): string {
	return `org:${orgId}:recipes:${id}`;
}
