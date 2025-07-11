import { z } from "zod/v4";
import { draftIngredientSchema } from "@/db/schema/ingredients";
import { insertRecipeSchema } from "@/db/schema/recipes";
import { insertSpecsSchema } from "@/db/schema/specs";

export const upsertRecipeSchema = insertRecipeSchema
	.omit({
		id: true,
		orgId: true,
		archivedAt: true,
		archivedBy: true,
		createdAt: true,
		createdBy: true,
		updatedAt: true,
	})
	.extend({
		id: z.string().optional(),
	});

export const upsertSpecSchema = insertSpecsSchema
	.omit({
		id: true,
		createdAt: true,
		recipeId: true,
	})
	.extend({
		id: z.string().optional(),
		ingredientId: z.string().optional(),
		ingredient: draftIngredientSchema.optional(),
	})
	.refine((data) => data.ingredientId || data.ingredient, {
		message: "Either ingredientId or ingredient data must be provided",
		path: ["ingredientId"],
	});

export const recipeFormSchema = z.object({
	recipe: upsertRecipeSchema.optional(),
	specs: z.array(upsertSpecSchema).optional(),
});

export type RecipeFormData = z.infer<typeof recipeFormSchema>;
