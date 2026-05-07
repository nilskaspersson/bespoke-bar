import type { Ingredient } from "@/db/schema/ingredients";
import type { RecipeTagWithTag } from "@/db/schema/recipes";
import type { RecipeTag } from "@/db/schema/recipeTags";
import type { Spec, SpecWithIngredient } from "@/db/schema/specs";
import type { Tag } from "@/db/schema/tags";
import {
	buildIngredientMap,
	stitchSpecs,
} from "@/features/specs/utils/stitchIngredients";
import {
	buildTagMap,
	stitchRecipeTags,
} from "@/features/tags/utils/stitchRecipeTags";

type RawRecipe = { specs: Spec[]; tags: RecipeTag[] };

type WithSpecs<R extends RawRecipe> = Omit<R, "specs"> & {
	specs: SpecWithIngredient[];
};

type WithTags<R extends RawRecipe> = Omit<R, "tags"> & {
	tags: RecipeTagWithTag[];
};

type WithBoth<R extends RawRecipe> = Omit<R, "specs" | "tags"> & {
	specs: SpecWithIngredient[];
	tags: RecipeTagWithTag[];
};

export function stitchRecipes<R extends RawRecipe>(
	recipes: R[],
	options: { ingredients: Ingredient[]; tags: Tag[] },
): WithBoth<R>[];
export function stitchRecipes<R extends RawRecipe>(
	recipes: R[],
	options: { ingredients: Ingredient[]; tags?: never },
): WithSpecs<R>[];
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
			? { specs: stitchSpecs(recipe.specs, ingredientMap) }
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
): WithSpecs<R>;
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
			? { specs: stitchSpecs(recipe.specs, ingredientMap) }
			: {}),
		...(tagMap ? { tags: stitchRecipeTags(recipe.tags, tagMap) } : {}),
	};
}
