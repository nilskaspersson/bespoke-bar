import { updateTag } from "next/cache";
import type { Ingredient } from "@/db/schema/ingredients";
import type { RecipeList } from "@/db/schema/recipeLists";
import type { Recipe } from "@/db/schema/recipes";
import type { Tag } from "@/db/schema/tags";

/**
 * We use cacheTag and updateTag as an event system; Every mutating action
 * emits a related revalidation.
 *
 * Cached functions "subscribe" to these events by calling `cacheTag` over the
 * associated tag, optionally with an id for more granular invalidation.
 */
export const cacheEvents = {
	recipe: {
		create: {
			emit: (orgId: string) => updateTag(`${orgId}:create-recipe`),
			tag: (orgId: string) => `${orgId}:create-recipe`,
		},
		update: {
			emit: (orgId: string, id: Recipe["id"]) => {
				updateTag(`${orgId}:update-recipe`);
				updateTag(`${orgId}:update-recipe:${id}`);
			},
			tag: (orgId: string, id?: Recipe["id"]) =>
				id ? `${orgId}:update-recipe:${id}` : `${orgId}:update-recipe`,
		},
		delete: {
			emit: (orgId: string, id: Recipe["id"]) => {
				updateTag(`${orgId}:delete-recipe`);
				updateTag(`${orgId}:delete-recipe:${id}`);
			},
			tag: (orgId: string, id?: Recipe["id"]) =>
				id ? `${orgId}:delete-recipe:${id}` : `${orgId}:delete-recipe`,
		},
	},
	recipeList: {
		create: {
			emit: (orgId: string) => updateTag(`${orgId}:create-recipe-list`),
			tag: (orgId: string) => `${orgId}:create-recipe-list`,
		},
		update: {
			emit: (orgId: string, id: RecipeList["id"]) => {
				updateTag(`${orgId}:update-recipe-list`);
				updateTag(`${orgId}:update-recipe-list:${id}`);
			},
			tag: (orgId: string, id?: RecipeList["id"]) =>
				id
					? `${orgId}:update-recipe-list:${id}`
					: `${orgId}:update-recipe-list`,
		},
		delete: {
			emit: (orgId: string, id: RecipeList["id"]) => {
				updateTag(`${orgId}:delete-recipe-list`);
				updateTag(`${orgId}:delete-recipe-list:${id}`);
			},
			tag: (orgId: string, id?: RecipeList["id"]) =>
				id
					? `${orgId}:delete-recipe-list:${id}`
					: `${orgId}:delete-recipe-list`,
		},
	},
	ingredient: {
		create: {
			emit: (orgId: string) => updateTag(`${orgId}:create-ingredient`),
			tag: (orgId: string) => `${orgId}:create-ingredient`,
		},
		update: {
			emit: (orgId: string, id: Ingredient["id"]) => {
				updateTag(`${orgId}:update-ingredient`);
				updateTag(`${orgId}:update-ingredient:${id}`);
			},
			tag: (orgId: string, id?: Ingredient["id"]) =>
				id ? `${orgId}:update-ingredient:${id}` : `${orgId}:update-ingredient`,
		},
		delete: {
			emit: (orgId: string, id: Ingredient["id"]) => {
				updateTag(`${orgId}:delete-ingredient`);
				updateTag(`${orgId}:delete-ingredient:${id}`);
			},
			tag: (orgId: string, id?: Ingredient["id"]) =>
				id ? `${orgId}:delete-ingredient:${id}` : `${orgId}:delete-ingredient`,
		},
	},
	favorite: {
		toggle: {
			emit: (orgId: string, userId: string) => {
				updateTag(`${orgId}:toggle-favorite`);
				updateTag(`${orgId}:toggle-favorite:${userId}`);
			},
			tag: (orgId: string, userId?: string) =>
				userId
					? `${orgId}:toggle-favorite:${userId}`
					: `${orgId}:toggle-favorite`,
		},
	},
	tag: {
		create: {
			emit: (orgId: string) => updateTag(`${orgId}:create-tag`),
			tag: (orgId: string) => `${orgId}:create-tag`,
		},
		update: {
			emit: (orgId: string, id: Tag["id"]) => {
				updateTag(`${orgId}:update-tag`);
				updateTag(`${orgId}:update-tag:${id}`);
			},
			tag: (orgId: string, id?: Tag["id"]) =>
				id ? `${orgId}:update-tag:${id}` : `${orgId}:update-tag`,
		},
		delete: {
			emit: (orgId: string, id: Tag["id"]) => {
				updateTag(`${orgId}:delete-tag`);
				updateTag(`${orgId}:delete-tag:${id}`);
			},
			tag: (orgId: string, id?: Tag["id"]) =>
				id ? `${orgId}:delete-tag:${id}` : `${orgId}:delete-tag`,
		},
	},
	recipeSlotGrant: {
		create: {
			emit: (orgId: string) => updateTag(`${orgId}:create-recipe-slot-grant`),
			tag: (orgId: string) => `${orgId}:create-recipe-slot-grant`,
		},
	},
	organisation: {
		/**
		 * `create` and `delete` are keyed by `clerkOrgId` because the
		 * lookup that subscribes to them runs before the local id is
		 * known. `update` stays keyed by the local id, like every other
		 * event.
		 */
		create: {
			emit: (clerkOrgId: string) =>
				updateTag(`${clerkOrgId}:create-organisation`),
			tag: (clerkOrgId: string) => `${clerkOrgId}:create-organisation`,
		},
		update: {
			emit: (orgId: string) => updateTag(`${orgId}:update-organisation`),
			tag: (orgId: string) => `${orgId}:update-organisation`,
		},
		delete: {
			emit: (clerkOrgId: string) =>
				updateTag(`${clerkOrgId}:delete-organisation`),
			tag: (clerkOrgId: string) => `${clerkOrgId}:delete-organisation`,
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
	 * Saturated Recipes subscribe to per-id recipe events, plus per-id ingredient
	 * and tag events derived from the loaded data. ingredient.delete is omitted
	 * by design — a FK constraint prevents deleting an ingredient in use.
	 */
	recipeWithIngredients: (
		orgId: string,
		id: Recipe["id"],
		ingredientIds: Ingredient["id"][],
		tagIds: Tag["id"][],
	) => [
		cacheEvents.recipe.update.tag(orgId, id),
		cacheEvents.recipe.delete.tag(orgId, id),
		...ingredientIds.map((iid) =>
			cacheEvents.ingredient.update.tag(orgId, iid),
		),
		...tagIds.map((tid) => cacheEvents.tag.update.tag(orgId, tid)),
		...tagIds.map((tid) => cacheEvents.tag.delete.tag(orgId, tid)),
	],
	/**
	 * Saturated bar-recipe list subscribes to org-wide recipe events plus per-id
	 * ingredient and tag events deduped from the loaded data. Once an org grows
	 * past the point where per-id tracking fits under the 64-tag cap on a
	 * cached function, this falls back to org-wide ingredient/tag subscriptions
	 * — granular while it's feasible, coarse once it isn't.
	 */
	barRecipes: (
		orgId: string,
		ingredientIds: Ingredient["id"][],
		tagIds: Tag["id"][],
	) => {
		const baseTags = [
			cacheEvents.recipe.create.tag(orgId),
			cacheEvents.recipe.update.tag(orgId),
			cacheEvents.recipe.delete.tag(orgId),
		];

		const tags = [
			...baseTags,
			...ingredientIds.map((iid) =>
				cacheEvents.ingredient.update.tag(orgId, iid),
			),
			...tagIds.map((tid) => cacheEvents.tag.update.tag(orgId, tid)),
			...tagIds.map((tid) => cacheEvents.tag.delete.tag(orgId, tid)),
		];

		if (tags.length > 60) {
			return [
				...baseTags,
				cacheEvents.ingredient.update.tag(orgId),
				cacheEvents.tag.update.tag(orgId),
				cacheEvents.tag.delete.tag(orgId),
			];
		}

		return tags;
	},
	/**
	 * Just the count of recipes — only changes when a recipe is added or removed.
	 * Ingredient and tag mutations don't affect the number, so don't subscribe.
	 */
	countBarRecipes: (orgId: string) => [
		cacheEvents.recipe.create.tag(orgId),
		cacheEvents.recipe.delete.tag(orgId),
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
	favorite: {
		toggle: (orgId: string, userId: string) => [
			cacheEvents.favorite.toggle.tag(orgId, userId),
		],
	},
	tagsList: (orgId: string) => [
		cacheEvents.tag.create.tag(orgId),
		cacheEvents.tag.update.tag(orgId),
		cacheEvents.tag.delete.tag(orgId),
	],
	recipeSlotLimit: (orgId: string) => [
		cacheEvents.recipeSlotGrant.create.tag(orgId),
		cacheEvents.organisation.update.tag(orgId),
	],
	recipeSlotUsage: (orgId: string) => [
		cacheEvents.recipeSlotGrant.create.tag(orgId),
		cacheEvents.recipe.create.tag(orgId),
		cacheEvents.recipe.delete.tag(orgId),
		cacheEvents.organisation.update.tag(orgId),
	],
	organisation: (orgId: string) => [cacheEvents.organisation.update.tag(orgId)],
	/**
	 * Used by the clerkOrgId → localOrgId lookup, which has to be keyed by
	 * Clerk's id (the local one isn't known yet). Subscribes to create and
	 * delete because both flip whether a row exists.
	 */
	organisationByClerkId: (clerkOrgId: string) => [
		cacheEvents.organisation.create.tag(clerkOrgId),
		cacheEvents.organisation.delete.tag(clerkOrgId),
	],
};
