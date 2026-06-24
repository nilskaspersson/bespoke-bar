import { relations, sql } from "drizzle-orm";
import {
	boolean,
	check,
	doublePrecision,
	index,
	pgTable,
	text,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import type { Identity } from "../types";
import { createdAtCol, nanoidPk } from "./columns";
import { type Ingredient, IngredientsTable } from "./ingredients";
import { RecipesTable } from "./recipes";
import { unitEnum } from "./units";

export const IngredientLinesTable = pgTable(
	"ingredient_lines",
	{
		id: nanoidPk(),
		recipeId: text("recipe_id")
			.notNull()
			.references(() => RecipesTable.id, { onDelete: "cascade" }),
		quantity: doublePrecision("quantity"),
		unit: unitEnum("unit"),
		ingredientId: text("ingredient_id")
			.notNull()
			.references(() => IngredientsTable.id, { onDelete: "restrict" }),
		createdAt: createdAtCol(),
		optional: boolean("optional").default(false),
	},
	(table) => [
		check(
			"quantity_null_or_positive",
			sql`${table.quantity} IS NULL OR ${table.quantity} > 0`,
		),
		index("idx_ingredient_lines_ingredient").on(table.ingredientId),
		index("idx_ingredient_lines_recipe_ingredient").on(
			table.recipeId,
			table.ingredientId,
		),
	],
);

export const ingredientLinesRelations = relations(
	IngredientLinesTable,
	({ one }) => ({
		recipe: one(RecipesTable, {
			fields: [IngredientLinesTable.recipeId],
			references: [RecipesTable.id],
		}),
		ingredient: one(IngredientsTable, {
			fields: [IngredientLinesTable.ingredientId],
			references: [IngredientsTable.id],
		}),
	}),
);

export type IngredientLine = typeof IngredientLinesTable.$inferSelect;

export type InsertIngredientLine = Omit<
	typeof IngredientLinesTable.$inferInsert,
	"id" | "createdAt"
>;

/**
 * The fields users can provide to create an ingredient line.
 */
export type DraftIngredientLine = Identity<
	Partial<
		Pick<IngredientLine, "quantity" | "unit" | "ingredientId" | "optional">
	>
>;

export type IngredientLineWithIngredient = IngredientLine & {
	ingredient: Ingredient;
};

export type DraftIngredientLineWithDraftIngredient = DraftIngredientLine & {
	ingredient: Partial<Ingredient>;
};

const ingredientLinesConstraintsSchema = {
	quantity: z.coerce.number().positive().nullable(),
};

export const insertIngredientLinesSchema = createInsertSchema(
	IngredientLinesTable,
).extend(ingredientLinesConstraintsSchema);
