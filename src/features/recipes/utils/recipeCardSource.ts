import type { Recipe } from "@/db/schema/recipes";

const ATTR = "data-recipe-id";

export function recipeCardSourceProps(recipe: Pick<Recipe, "id">) {
	return { [ATTR]: recipe.id } as const;
}

export function findRecipeCardEl(recipeId: Recipe["id"]) {
	return document.querySelector<HTMLElement>(`[${ATTR}="${recipeId}"]`);
}
