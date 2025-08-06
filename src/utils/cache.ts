import { revalidateTag } from "next/cache";
import type { Ingredient } from "@/db/schema/ingredients";
import type { RecipeList } from "@/db/schema/recipeLists";
import type { Recipe } from "@/db/schema/recipes";

/**
 * We use cacheTag and revalidateTag as an event system; Every mutating action
 * emits a related revalidation.
 *
 * Cached functions "subscribe" to these events by calling `cacheTag` over the
 * associated tag, optionally with an id for more granular invalidation.
 */
export const cacheEvents = {
	recipe: {
		create: {
			emit: (orgId: string) => revalidateTag(`${orgId}:create-recipe`),
			tag: (orgId: string) => `${orgId}:create-recipe`,
		},
		update: {
			emit: (orgId: string, id: Recipe["id"]) => {
				revalidateTag(`${orgId}:update-recipe`);
				revalidateTag(`${orgId}:update-recipe:${id}`);
			},
			tag: (orgId: string, id?: Recipe["id"]) =>
				id ? `${orgId}:update-recipe:${id}` : `${orgId}:update-recipe`,
		},
		delete: {
			emit: (orgId: string, id: Recipe["id"]) => {
				revalidateTag(`${orgId}:delete-recipe`);
				revalidateTag(`${orgId}:delete-recipe:${id}`);
			},
			tag: (orgId: string, id?: Recipe["id"]) =>
				id ? `${orgId}:delete-recipe:${id}` : `${orgId}:delete-recipe`,
		},
	},
	recipeList: {
		create: {
			emit: (orgId: string) => revalidateTag(`${orgId}:create-recipe-list`),
			tag: (orgId: string) => `${orgId}:create-recipe-list`,
		},
		update: {
			emit: (orgId: string, id: RecipeList["id"]) => {
				revalidateTag(`${orgId}:update-recipe-list`);
				revalidateTag(`${orgId}:update-recipe-list:${id}`);
			},
			tag: (orgId: string, id?: RecipeList["id"]) =>
				id
					? `${orgId}:update-recipe-list:${id}`
					: `${orgId}:update-recipe-list`,
		},
		delete: {
			emit: (orgId: string, id: RecipeList["id"]) => {
				revalidateTag(`${orgId}:delete-recipe-list`);
				revalidateTag(`${orgId}:delete-recipe-list:${id}`);
			},
			tag: (orgId: string, id?: RecipeList["id"]) =>
				id
					? `${orgId}:delete-recipe-list:${id}`
					: `${orgId}:delete-recipe-list`,
		},
	},
	ingredient: {
		create: {
			emit: (orgId: string) => revalidateTag(`${orgId}:create-ingredient`),
			tag: (orgId: string) => `${orgId}:create-ingredient`,
		},
		update: {
			emit: (orgId: string, id: Ingredient["id"]) => {
				revalidateTag(`${orgId}:update-ingredient`);
				revalidateTag(`${orgId}:update-ingredient:${id}`);
			},
			tag: (orgId: string, id?: Ingredient["id"]) =>
				id ? `${orgId}:update-ingredient:${id}` : `${orgId}:update-ingredient`,
		},
		delete: {
			emit: (orgId: string, id: Ingredient["id"]) => {
				revalidateTag(`${orgId}:delete-ingredient`);
				revalidateTag(`${orgId}:delete-ingredient:${id}`);
			},
			tag: (orgId: string, id?: Ingredient["id"]) =>
				id ? `${orgId}:delete-ingredient:${id}` : `${orgId}:delete-ingredient`,
		},
	},
};

/**
 * For use as spread args to `cacheTag`, f.e.:
 * cacheTag(...cacheTags.recipeLists(orgId));
 */
export const cacheTags = {
	/**
	 * Ingredients have very few concerns. We do query for Recipe usage, but that's
	 * separately tagged under barRecipes.
	 */
	ingredient: (orgId: string, id: Ingredient["id"]) => [
		cacheEvents.ingredient.update.tag(orgId, id),
		cacheEvents.ingredient.delete.tag(orgId, id),
	],
	ingredientsList: (orgId: string) => [
		cacheEvents.ingredient.create.tag(orgId),
		cacheEvents.ingredient.update.tag(orgId),
		cacheEvents.ingredient.delete.tag(orgId),
	],
	/**
	 * Saturated Recipes subscribe to updates and deletes, as well as ingredient
	 * updates. ingredient.delete is deliberately absent, as there's a constraint
	 * preventing deletion of an ingredient that is in use by a recipe.
	 */
	recipeWithIngredients: (orgId: string, id?: Recipe["id"]) => [
		cacheEvents.recipe.update.tag(orgId, id),
		cacheEvents.recipe.delete.tag(orgId, id),
		cacheEvents.ingredient.update.tag(orgId),
	],
	/**
	 * Any modification- or creation of a recipe should invalidate the full list of
	 * recipes. Ingredient updates are added to reflect name changes.
	 */
	barRecipes: (orgId: string) => [
		cacheEvents.recipe.create.tag(orgId),
		cacheEvents.recipe.update.tag(orgId),
		cacheEvents.recipe.delete.tag(orgId),
		cacheEvents.ingredient.update.tag(orgId),
	],
	/**
	 * The list of Recipe Lists cares about all recipeList events, as well as
	 * deletion of recipes (we show a count of recipe assignments).
	 */
	recipeLists: (orgId: string) => [
		cacheEvents.recipeList.create.tag(orgId),
		cacheEvents.recipeList.update.tag(orgId),
		cacheEvents.recipeList.delete.tag(orgId),
		cacheEvents.recipe.delete.tag(orgId),
	],
	/**
	 * Recipe Lists are in an awkward state, where we could technically use the
	 * entry -> recipe mappings to subscribe to specific recipe- and ingredient
	 * events, BUT a cached fn can NOT have more than 64 tags.
	 *
	 * That means we'd run into issues after ~20 recipes per list. Not sure if an
	 * error is thrown or if further tags are ignored, but at least for now we'll
	 * stick to global invalidation of those events.
	 */
	recipeListWithRecipes: (orgId: string, id?: RecipeList["id"]) => [
		cacheEvents.recipeList.update.tag(orgId, id),
		cacheEvents.recipeList.delete.tag(orgId, id),
		cacheEvents.recipe.delete.tag(orgId),
		cacheEvents.recipe.update.tag(orgId),
		cacheEvents.ingredient.update.tag(orgId),
	],
};
