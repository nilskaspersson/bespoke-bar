import type {
	BaseRecipe,
	Recipe,
	RecipeWithLines,
} from "@bespoke/schema/schema/recipes";
import { hasNoLines } from "../ingredientLines/predicates";
import { isObject } from "../utils/collection";

export function isEmptyDraftRecipe(recipe: BaseRecipe) {
	return !recipe.name && hasNoLines(recipe.lines);
}

export function isRecipe(o: unknown): o is Recipe {
	return (
		isObject(o) && Object.hasOwn(o, "id") && Object.hasOwn(o, "instructions")
	);
}

export function isRecipeWithLines(o: unknown): o is RecipeWithLines {
	return isObject(o) && Object.hasOwn(o, "lines");
}
