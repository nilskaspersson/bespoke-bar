import { z } from "zod/v4";
import { draftIngredientSchema } from "@/db/schema/ingredients";
import { recipeListEntryFormSchema } from "@/db/schema/recipeListEntries";
import { recipeListFormSchema } from "@/db/schema/recipeLists";
import { insertRecipeSchema } from "@/db/schema/recipes";
import { insertSpecsSchema } from "@/db/schema/specs";
import { percentageToRatioSchema } from "@/features/ingredients/utils/percentageToRatio";

/**
 * Recipes with specs and ingredients
 */
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

const ingredientFormDataSchema = draftIngredientSchema.extend({
	abv: percentageToRatioSchema.optional(),
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
		ingredient: ingredientFormDataSchema.optional(),
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

export type IngredientFormData = z.infer<typeof ingredientFormDataSchema>;

/**
 * Recipe lists with entries
 */
export const recipeListWithEntriesFormSchema = z.object({
	recipeList: recipeListFormSchema,
	entries: z.array(recipeListEntryFormSchema),
});

export type RecipeListWithEntriesFormData = z.infer<
	typeof recipeListWithEntriesFormSchema
>;
