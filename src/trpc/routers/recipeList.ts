import { z } from "zod";
import { recipeListWithEntriesFormSchema } from "@/db/schema/composite";
import { recipeListFormSchema } from "@/db/schema/recipeLists";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { createRecipeList } from "@/features/lists/api/createRecipeList.service";
import { deleteRecipeList } from "@/features/lists/api/deleteRecipeList.service";
import { getCachedRecipeLists } from "@/features/lists/api/readBarRecipeLists";
import { getCachedRecipeList } from "@/features/lists/api/readRecipeList";
import { upsertRecipeListWithEntries } from "@/features/lists/api/upsertRecipeListWithEntries.service";
import {
	buildIngredientMap,
	stitchRecipeListEntries,
} from "@/features/specs/utils/stitchIngredients";
import { protectedProcedure, router } from "@/trpc";

export const recipeListRouter = router({
	list: protectedProcedure.query(({ ctx }) => {
		return getCachedRecipeLists(ctx.orgId);
	}),

	byId: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const [rawList, ingredients] = await Promise.all([
				getCachedRecipeList(ctx.orgId, input.id),
				getCachedIngredients(ctx.orgId),
			]);
			if (!rawList) return rawList;
			return stitchRecipeListEntries(rawList, buildIngredientMap(ingredients));
		}),

	create: protectedProcedure
		.input(recipeListFormSchema)
		.mutation(({ ctx, input }) => {
			return createRecipeList(ctx, input);
		}),

	upsertWithEntries: protectedProcedure
		.input(recipeListWithEntriesFormSchema)
		.mutation(({ ctx, input }) => {
			return upsertRecipeListWithEntries(ctx, input);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ ctx, input }) => {
			return deleteRecipeList(ctx, input.id);
		}),
});
