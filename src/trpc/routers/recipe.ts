import { z } from "zod";
import { recipeFormSchema } from "@/db/schema/composite";
import { updateRecipeSchema } from "@/db/schema/recipes";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { getCachedCountBarRecipes } from "@/features/recipes/api/countBarRecipes";
import { deleteRecipe } from "@/features/recipes/api/deleteRecipe.service";
import { duplicateRecipe } from "@/features/recipes/api/duplicateRecipe.service";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
import { getCachedRecipe } from "@/features/recipes/api/readRecipe";
import { updateRecipe } from "@/features/recipes/api/updateRecipe.service";
import { upsertRecipesWithSpecs } from "@/features/recipes/api/upsertRecipesWithSpecs.service";
import {
	buildIngredientMap,
	stitchRecipeSpecs,
} from "@/features/specs/utils/stitchIngredients";
import { protectedProcedure, router } from "@/trpc";

export const recipeRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		const [rawRecipes, ingredients] = await Promise.all([
			getCachedBarRecipes(ctx.orgId),
			getCachedIngredients(ctx.orgId),
		]);
		const ingredientMap = buildIngredientMap(ingredients);
		return rawRecipes.map((r) => stitchRecipeSpecs(r, ingredientMap));
	}),

	byId: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const [rawRecipe, ingredients] = await Promise.all([
				getCachedRecipe(ctx.orgId, input.id),
				getCachedIngredients(ctx.orgId),
			]);
			if (!rawRecipe) return rawRecipe;
			return stitchRecipeSpecs(rawRecipe, buildIngredientMap(ingredients));
		}),

	count: protectedProcedure.query(({ ctx }) => {
		return getCachedCountBarRecipes(ctx.orgId);
	}),

	upsertWithSpecs: protectedProcedure
		.input(z.union([recipeFormSchema, z.array(recipeFormSchema)]))
		.mutation(({ ctx, input }) => {
			const data = Array.isArray(input) ? input : [input];
			return upsertRecipesWithSpecs(ctx, data);
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
