import { revalidateTag, updateTag } from "next/cache";
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
			emit: (orgId: string, userId: string) =>
				updateTag(`${orgId}:toggle-favorite:${userId}`),
			tag: (orgId: string, userId: string) =>
				`${orgId}:toggle-favorite:${userId}`,
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
			emitFromRouteHandler: (orgId: string) =>
				revalidateTag(`${orgId}:create-recipe-slot-grant`, { expire: 0 }),
			tag: (orgId: string) => `${orgId}:create-recipe-slot-grant`,
		},
	},
	ocrQuotaGrant: {
		create: {
			emit: (orgId: string) => updateTag(`${orgId}:create-ocr-quota-grant`),
			tag: (orgId: string) => `${orgId}:create-ocr-quota-grant`,
		},
	},
	ocrQuotaUse: {
		changed: {
			/**
			 * Emitted from a Route Handler, where `updateTag` is illegal.
			 * `revalidateTag` with `{ expire: 0 }` expires the tag immediately, so
			 * the client's post-Use refetch of `billing.ocrQuotaState` reads the
			 * fresh count. The `"max"` profile would serve stale-while-revalidate and
			 * leave the indicator one Use behind on that refetch.
			 */
			emit: (orgId: string) =>
				revalidateTag(`${orgId}:changed-ocr-quota-use`, { expire: 0 }),
			tag: (orgId: string) => `${orgId}:changed-ocr-quota-use`,
		},
	},
	orgSubscription: {
		update: {
			emit: (orgId: string) =>
				revalidateTag(`${orgId}:update-org-subscription`, { expire: 0 }),
			tag: (orgId: string) => `${orgId}:update-org-subscription`,
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
			emitFromRouteHandler: (orgId: string) =>
				revalidateTag(`${orgId}:update-organisation`, { expire: 0 }),
			tag: (orgId: string) => `${orgId}:update-organisation`,
		},
		delete: {
			emit: (clerkOrgId: string) =>
				updateTag(`${clerkOrgId}:delete-organisation`),
			tag: (clerkOrgId: string) => `${clerkOrgId}:delete-organisation`,
		},
	},
};

export const cacheTags = {
	ingredient: (orgId: string, id: Ingredient["id"]) => [
		cacheEvents.ingredient.update.tag(orgId, id),
		cacheEvents.ingredient.delete.tag(orgId, id),
	],
	ingredientsList: (orgId: string) => [
		cacheEvents.ingredient.create.tag(orgId),
		cacheEvents.ingredient.update.tag(orgId),
		cacheEvents.ingredient.delete.tag(orgId),
	],
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
	countBarRecipes: (orgId: string) => [
		cacheEvents.recipe.create.tag(orgId),
		cacheEvents.recipe.delete.tag(orgId),
	],
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
	ocrQuotaLimit: (orgId: string) => [
		cacheEvents.ocrQuotaGrant.create.tag(orgId),
		cacheEvents.organisation.update.tag(orgId),
		cacheEvents.orgSubscription.update.tag(orgId),
	],
	ocrQuotaUsage: (orgId: string) => [
		cacheEvents.ocrQuotaUse.changed.tag(orgId),
	],
	organisation: (orgId: string) => [cacheEvents.organisation.update.tag(orgId)],
	orgSubscription: (orgId: string) => [
		cacheEvents.orgSubscription.update.tag(orgId),
	],
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
