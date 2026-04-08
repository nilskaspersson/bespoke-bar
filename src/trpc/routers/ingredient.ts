import { z } from "zod";
import {
	draftIngredientSchema,
	updateIngredientSchema,
} from "@/db/schema/ingredients";
import { createIngredient } from "@/features/ingredients/api/createIngredient.service";
import { deleteIngredient } from "@/features/ingredients/api/deleteIngredient.service";
import { getCachedIngredient } from "@/features/ingredients/api/readIngredient";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { updateIngredient } from "@/features/ingredients/api/updateIngredient.service";
import { protectedProcedure, router } from "@/trpc";

export const ingredientRouter = router({
	list: protectedProcedure.query(({ ctx }) => {
		return getCachedIngredients(ctx.orgId);
	}),

	byId: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(({ ctx, input }) => {
			return getCachedIngredient(ctx.orgId, input.id);
		}),

	create: protectedProcedure
		.input(draftIngredientSchema)
		.mutation(({ ctx, input }) => {
			return createIngredient(ctx, input);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateIngredientSchema }))
		.mutation(({ ctx, input }) => {
			return updateIngredient(ctx, input.id, input.data);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ ctx, input }) => {
			return deleteIngredient(ctx, input.id);
		}),
});
