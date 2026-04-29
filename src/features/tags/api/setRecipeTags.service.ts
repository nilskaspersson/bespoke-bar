import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { type Recipe, RecipesTable } from "@/db/schema/recipes";
import { RecipeTagsTable } from "@/db/schema/recipeTags";
import { TagsTable } from "@/db/schema/tags";
import { MAX_TAGS_PER_RECIPE } from "@/features/tags/constants";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function setRecipeTags(
	auth: Auth,
	recipeId: Recipe["id"],
	tagIds: string[],
): Promise<void> {
	const { orgId } = auth;
	const uniqueTagIds = Array.from(new Set(tagIds));

	if (uniqueTagIds.length > MAX_TAGS_PER_RECIPE) {
		throw new Error(
			`Recipe tag limit is ${MAX_TAGS_PER_RECIPE}. Remove some before adding more.`,
		);
	}

	await db.transaction(async (tx) => {
		const recipe = await tx.query.RecipesTable.findFirst({
			where: and(eq(RecipesTable.id, recipeId), eq(RecipesTable.orgId, orgId)),
			columns: { id: true },
		});

		if (!recipe) {
			throw new Error(`Recipe ${recipeId} not found in org`);
		}

		if (uniqueTagIds.length > 0) {
			/**
			 * Verify all tags belong to the auth's org before linking — FK alone
			 * doesn't enforce org boundaries, so without this we'd accept tagIds
			 * smuggled in from another org.
			 */
			const validTags = await tx.query.TagsTable.findMany({
				where: and(
					inArray(TagsTable.id, uniqueTagIds),
					eq(TagsTable.orgId, orgId),
				),
				columns: { id: true },
			});

			if (validTags.length !== uniqueTagIds.length) {
				throw new Error("Some tags do not belong to this org");
			}
		}

		await tx
			.delete(RecipeTagsTable)
			.where(eq(RecipeTagsTable.recipeId, recipeId));

		if (uniqueTagIds.length > 0) {
			await tx.insert(RecipeTagsTable).values(
				uniqueTagIds.map((tagId) => ({
					recipeId,
					tagId,
					orgId,
				})),
			);
		}
	});

	cacheEvents.recipe.update.emit(orgId, recipeId);
}
