import {
	stitchRecipe,
	stitchRecipes,
} from "@bespoke/domain/recipes/stitchRecipe";
import { recipeFormSchema } from "@bespoke/schema/schema/composite";
import { updateRecipeSchema } from "@bespoke/schema/schema/recipes";
import { z } from "zod";
import { getCachedIngredients } from "../../ingredients/readIngredients";
import { getCachedCountBarRecipes } from "../../recipes/countBarRecipes";
import { deleteRecipe } from "../../recipes/deleteRecipe.service";
import { duplicateRecipe } from "../../recipes/duplicateRecipe.service";
import { getCachedBarRecipes } from "../../recipes/readBarRecipes";
import { getCachedRecipe } from "../../recipes/readRecipe";
import { updateRecipe } from "../../recipes/updateRecipe.service";
import { upsertRecipesWithLines } from "../../recipes/upsertRecipesWithLines.service";
import { getCachedTags } from "../../tags/listTags";
import { protectedProcedure, router } from "../index";

export const recipeRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		const [rawRecipes, ingredients, tags] = await Promise.all([
			getCachedBarRecipes(ctx.orgId),
			getCachedIngredients(ctx.orgId),
			getCachedTags(ctx.orgId),
		]);
		return stitchRecipes(rawRecipes, { ingredients, tags });
	}),

	byId: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const [rawRecipe, ingredients, tags] = await Promise.all([
				getCachedRecipe(ctx.orgId, input.id),
				getCachedIngredients(ctx.orgId),
				getCachedTags(ctx.orgId),
			]);
			if (!rawRecipe) return rawRecipe;
			return stitchRecipe(rawRecipe, { ingredients, tags });
		}),

	count: protectedProcedure.query(({ ctx }) => {
		return getCachedCountBarRecipes(ctx.orgId);
	}),

	upsertWithLines: protectedProcedure
		.input(z.union([recipeFormSchema, z.array(recipeFormSchema)]))
		.mutation(({ ctx, input }) => {
			const data = Array.isArray(input) ? input : [input];
			return upsertRecipesWithLines(ctx, data);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateRecipeSchema }))
		.mutation(({ ctx, input }) => {
			return updateRecipe(ctx, input.id, input.data);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ ctx, input }) => {
			return deleteRecipe(ctx, input.id);
		}),

	duplicate: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ ctx, input }) => {
			return duplicateRecipe(ctx, input.id);
		}),
});
