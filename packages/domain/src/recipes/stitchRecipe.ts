import type {
	IngredientLine,
	IngredientLineWithIngredient,
} from "@bespoke/schema/schema/ingredientLines";
import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import type { RecipeTagWithTag } from "@bespoke/schema/schema/recipes";
import type { RecipeTag } from "@bespoke/schema/schema/recipeTags";
import type { Tag } from "@bespoke/schema/schema/tags";
import {
	buildIngredientMap,
	stitchLines,
} from "../ingredientLines/stitchIngredients";
import { buildTagMap, stitchRecipeTags } from "../tags/stitchRecipeTags";

type RawRecipe = { lines: IngredientLine[]; tags: RecipeTag[] };

type WithLines<R extends RawRecipe> = Omit<R, "lines"> & {
	lines: IngredientLineWithIngredient[];
};

type WithTags<R extends RawRecipe> = Omit<R, "tags"> & {
	tags: RecipeTagWithTag[];
};

type WithBoth<R extends RawRecipe> = Omit<R, "lines" | "tags"> & {
	lines: IngredientLineWithIngredient[];
	tags: RecipeTagWithTag[];
};

export function stitchRecipes<R extends RawRecipe>(
	recipes: R[],
	options: { ingredients: Ingredient[]; tags: Tag[] },
): WithBoth<R>[];
export function stitchRecipes<R extends RawRecipe>(
	recipes: R[],
	options: { ingredients: Ingredient[]; tags?: never },
): WithLines<R>[];
export function stitchRecipes<R extends RawRecipe>(
	recipes: R[],
	options: { ingredients?: never; tags: Tag[] },
): WithTags<R>[];
export function stitchRecipes<R extends RawRecipe>(
	recipes: R[],
	options: { ingredients?: Ingredient[]; tags?: Tag[] },
): unknown[] {
	const ingredientMap = options.ingredients
		? buildIngredientMap(options.ingredients)
		: null;

	const tagMap = options.tags ? buildTagMap(options.tags) : null;

	return recipes.map((recipe) => ({
		...recipe,
		...(ingredientMap
			? { lines: stitchLines(recipe.lines, ingredientMap) }
			: {}),
		...(tagMap ? { tags: stitchRecipeTags(recipe.tags, tagMap) } : {}),
	}));
}

export function stitchRecipe<R extends RawRecipe>(
	recipe: R,
	options: { ingredients: Ingredient[]; tags: Tag[] },
): WithBoth<R>;
export function stitchRecipe<R extends RawRecipe>(
	recipe: R,
	options: { ingredients: Ingredient[]; tags?: never },
): WithLines<R>;
export function stitchRecipe<R extends RawRecipe>(
	recipe: R,
	options: { ingredients?: never; tags: Tag[] },
): WithTags<R>;
export function stitchRecipe<R extends RawRecipe>(
	recipe: R,
	options: { ingredients?: Ingredient[]; tags?: Tag[] },
): unknown {
	const ingredientMap = options.ingredients
		? buildIngredientMap(options.ingredients)
		: null;
	const tagMap = options.tags ? buildTagMap(options.tags) : null;
	return {
		...recipe,
		...(ingredientMap
			? { lines: stitchLines(recipe.lines, ingredientMap) }
			: {}),
		...(tagMap ? { tags: stitchRecipeTags(recipe.tags, tagMap) } : {}),
	};
}
