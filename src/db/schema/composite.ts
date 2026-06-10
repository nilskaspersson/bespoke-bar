import { z } from "zod";
import {
	type IngredientLine,
	type IngredientLineWithIngredient,
	insertIngredientLinesSchema,
} from "@/db/schema/ingredientLines";
import { draftIngredientFormSchema } from "@/db/schema/ingredients";
import {
	type MenuEntryWithRecipe,
	menuEntryFormSchema,
	selectMenuEntrySchema,
} from "@/db/schema/menuEntries";
import { type Menu, menuFormSchema, selectMenuSchema } from "@/db/schema/menus";
import { insertRecipeSchema } from "@/db/schema/recipes";

/**
 * Caps the Recipe line count well above any known cocktail.
 */
export const MAX_LINES_PER_RECIPE = 20;

/**
 * Recipes with lines and ingredients
 */
export const upsertRecipeSchema = insertRecipeSchema
	.omit({
		id: true,
		orgId: true,
		createdAt: true,
		createdBy: true,
		updatedAt: true,
		aiEnrichedFields: true,
	})
	.extend({
		id: z.string().optional(),
	});

const upsertLineSchema = insertIngredientLinesSchema
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
	lines: z
		.array(upsertLineSchema)
		.max(
			MAX_LINES_PER_RECIPE,
			`Recipes can have at most ${MAX_LINES_PER_RECIPE} ingredients.`,
		)
		.optional(),
});

export type RecipeFormData = z.infer<typeof recipeFormSchema>;

export type IngredientFormData = z.infer<typeof draftIngredientFormSchema>;

/**
 * Recipe menus with entries
 */
export const menuWithEntriesFormSchema = z.object({
	menu: menuFormSchema,
	entries: z.array(menuEntryFormSchema.omit({ menuId: true })),
});

export type MenuWithEntriesFormData = z.infer<typeof menuWithEntriesFormSchema>;

const menuWithEntriesSchema = selectMenuSchema.extend({
	entries: z.array(
		selectMenuEntrySchema.extend({
			createdAt: z.string(),
			updatedAt: z.string().nullable(),
		}),
	),
	createdAt: z.string(),
	updatedAt: z.string().nullable(),
	featuredAt: z.string().nullable(),
});

export type MenuWithEntries = z.infer<typeof menuWithEntriesSchema>;

export type MenuWithRecipes<
	S extends IngredientLine = IngredientLineWithIngredient,
> = Menu & {
	entries: MenuEntryWithRecipe<S>[];
};
