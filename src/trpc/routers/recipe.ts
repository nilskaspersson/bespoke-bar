import { z } from "zod";
import { recipeFormSchema } from "@/db/schema/composite";
import { updateRecipeSchema } from "@/db/schema/recipes";
import {
	archiveRecipe,
	unarchiveRecipe,
} from "@/features/recipes/api/archiveRecipe.service";
import { getCachedCountArchivedBarRecipes } from "@/features/recipes/api/countArchivedBarRecipes";
import { getCachedCountBarRecipes } from "@/features/recipes/api/countBarRecipes";
import { deleteRecipe } from "@/features/recipes/api/deleteRecipe.service";
import { duplicateRecipe } from "@/features/recipes/api/duplicateRecipe.service";
import { getCachedArchivedBarRecipes } from "@/features/recipes/api/readArchivedBarRecipes";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
import { getCachedRecipe } from "@/features/recipes/api/readRecipe";
import { updateRecipe } from "@/features/recipes/api/updateRecipe.service";
import { upsertRecipesWithSpecs } from "@/features/recipes/api/upsertRecipesWithSpecs.service";
import { protectedProcedure, router } from "@/trpc";

export const recipeRouter = router({
	list: protectedProcedure.query(({ ctx }) => {
		return getCachedBarRecipes(ctx.orgId);
	}),

	byId: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(({ ctx, input }) => {
			return getCachedRecipe(ctx.orgId, input.id);
		}),

	count: protectedProcedure.query(({ ctx }) => {
		return getCachedCountBarRecipes(ctx.orgId);
	}),

	archived: protectedProcedure.query(({ ctx }) => {
		return getCachedArchivedBarRecipes(ctx.orgId);
	}),

	archivedCount: protectedProcedure.query(({ ctx }) => {
		return getCachedCountArchivedBarRecipes(ctx.orgId);
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

	archive: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ ctx, input }) => {
			return archiveRecipe(ctx, input.id);
		}),

	unarchive: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ ctx, input }) => {
			return unarchiveRecipe(ctx, input.id);
		}),

	duplicate: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ ctx, input }) => {
			return duplicateRecipe(ctx, input.id);
		}),
});
