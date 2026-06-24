import {
	draftIngredientSchema,
	updateIngredientSchema,
} from "@bespoke/schema/schema/ingredients";
import { z } from "zod";
import { createIngredient } from "../../ingredients/createIngredient.service";
import { deleteIngredient } from "../../ingredients/deleteIngredient.service";
import { getCachedIngredient } from "../../ingredients/readIngredient";
import { getCachedIngredients } from "../../ingredients/readIngredients";
import { updateIngredient } from "../../ingredients/updateIngredient.service";
import { protectedProcedure, router } from "../index";

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
