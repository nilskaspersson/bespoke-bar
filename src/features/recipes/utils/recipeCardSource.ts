import type { Recipe } from "@/db/schema/recipes";

const ATTR = "data-recipe-id";

export function recipeCardSourceProps(recipeId: Recipe) {
	return { [ATTR]: recipeId } as const;
}

export function findRecipeCardEl(recipeId: Recipe["id"]) {
	return document.querySelector<HTMLElement>(`[${ATTR}="${recipeId}"]`);
}
