import { z } from "zod";
import { draftIngredientFormSchema } from "@/db/schema/ingredients";
import {
	type RecipeListEntryWithRecipe,
	recipeListEntryFormSchema,
	selectRecipeListEntrySchema,
} from "@/db/schema/recipeListEntries";
import {
	type RecipeList,
	recipeListFormSchema,
	selectRecipeListSchema,
} from "@/db/schema/recipeLists";
import { insertRecipeSchema } from "@/db/schema/recipes";
import { insertSpecsSchema } from "@/db/schema/specs";

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

export const upsertSpecSchema = insertSpecsSchema
	.omit({
		id: true,
		createdAt: true,
		recipeId: true,
		ingredientId: true,
	})
	.extend({
		id: z.string().optional(),
		ingredientId: z.string().optional(),
		ingredient: draftIngredientFormSchema.optional(),
	})
	.refine((data) => data.ingredientId || data.ingredient, {
		message: "Either ingredientId or ingredient data must be provided",
		path: ["ingredientId"],
	})
	.refine(
		(data) => {
			/**
			 * Ingredient must pass validation if we're not using an existing ingredient.
			 */
			if (!data.ingredientId || data.ingredientId.trim() === "") {
				return (
					data.ingredient &&
					draftIngredientFormSchema.safeParse(data.ingredient).success
				);
			}

			return true;
		},
		{
			message:
				"Ingredient data is required when not using an existing ingredient.",
			path: ["ingredient"],
		},
	);

export const recipeFormSchema = z.object({
	recipe: upsertRecipeSchema.optional(),
	specs: z.array(upsertSpecSchema).optional(),
});

export type RecipeFormData = z.infer<typeof recipeFormSchema>;

export type IngredientFormData = z.infer<typeof draftIngredientFormSchema>;

/**
 * Recipe lists with entries
 */
export const recipeListWithEntriesFormSchema = z.object({
	recipeList: recipeListFormSchema,
	entries: z.array(recipeListEntryFormSchema.omit({ listId: true })),
});

export type RecipeListWithEntriesFormData = z.infer<
	typeof recipeListWithEntriesFormSchema
>;

export const recipeListWithEntriesSchema = selectRecipeListSchema.extend({
	entries: z.array(
		selectRecipeListEntrySchema.extend({
			createdAt: z.coerce.date(),
			updatedAt: z.coerce.date().nullable(),
		}),
	),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date().nullable(),
	featuredAt: z.coerce.date().nullable(),
});

export type RecipeListWithEntries = z.infer<typeof recipeListWithEntriesSchema>;

export type RecipeListWithRecipes = RecipeList & {
	entries: RecipeListEntryWithRecipe[];
};
