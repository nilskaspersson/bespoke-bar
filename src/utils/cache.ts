import { updateTag } from "next/cache";
import type { Ingredient } from "@/db/schema/ingredients";
import type { Menu } from "@/db/schema/menus";
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
	menu: {
		create: {
			emit: (orgId: string) => updateTag(`${orgId}:create-menu`),
			tag: (orgId: string) => `${orgId}:create-menu`,
		},
		update: {
			emit: (orgId: string, id: Menu["id"]) => {
				updateTag(`${orgId}:update-menu`);
				updateTag(`${orgId}:update-menu:${id}`);
			},
			tag: (orgId: string, id?: Menu["id"]) =>
				id ? `${orgId}:update-menu:${id}` : `${orgId}:update-menu`,
		},
		delete: {
			emit: (orgId: string, id: Menu["id"]) => {
				updateTag(`${orgId}:delete-menu`);
				updateTag(`${orgId}:delete-menu:${id}`);
			},
			tag: (orgId: string, id?: Menu["id"]) =>
				id ? `${orgId}:delete-menu:${id}` : `${orgId}:delete-menu`,
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
 * cacheTag(...cacheTags.menus(orgId));
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
	 * Recipe payload no longer joins tag entities — junctions stay,
	 * Tags are stitched in by callers from a separately-cached list. Only
	 * `tag.delete` matters here because it cascades to the junction row.
	 */
	recipe: (orgId: string, id: Recipe["id"]) => [
		cacheEvents.recipe.update.tag(orgId, id),
		cacheEvents.recipe.delete.tag(orgId, id),
		cacheEvents.tag.delete.tag(orgId),
	],
	barRecipes: (orgId: string) => [
		cacheEvents.recipe.create.tag(orgId),
		cacheEvents.recipe.update.tag(orgId),
		cacheEvents.recipe.delete.tag(orgId),
		cacheEvents.tag.delete.tag(orgId),
	],
	/**
	 * Just the count of recipes — only changes when a recipe is added or removed.
	 * Ingredient and tag mutations don't affect the number, so don't subscribe.
	 */
	countBarRecipes: (orgId: string) => [
		cacheEvents.recipe.create.tag(orgId),
		cacheEvents.recipe.delete.tag(orgId),
	],
	/**
	 * The Menus index cares about all menu events, as well as deletion
	 * of recipes (we show a count of recipe assignments).
	 */
	menus: (orgId: string) => [
		cacheEvents.menu.create.tag(orgId),
		cacheEvents.menu.update.tag(orgId),
		cacheEvents.menu.delete.tag(orgId),
		cacheEvents.recipe.delete.tag(orgId),
	],
	menuWithRecipes: (orgId: string, id?: Menu["id"]) => [
		cacheEvents.menu.update.tag(orgId, id),
		cacheEvents.menu.delete.tag(orgId, id),
		cacheEvents.recipe.delete.tag(orgId),
		cacheEvents.recipe.update.tag(orgId),
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
