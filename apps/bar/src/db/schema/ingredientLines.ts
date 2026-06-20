import { relations, sql } from "drizzle-orm";
import {
	boolean,
	check,
	doublePrecision,
	index,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { z } from "zod";
import { type Ingredient, IngredientsTable } from "@/db/schema/ingredients";
import { RecipesTable } from "@/db/schema/recipes";
import { unitEnum } from "@/db/schema/units";
import type { Identity } from "@/utils/types";

export const IngredientLinesTable = pgTable(
	"ingredient_lines",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid(10)),
		recipeId: text("recipe_id")
			.notNull()
			.references(() => RecipesTable.id, { onDelete: "cascade" }),
		quantity: doublePrecision("quantity"),
		unit: unitEnum("unit"),
		ingredientId: text("ingredient_id")
			.notNull()
			.references(() => IngredientsTable.id, { onDelete: "restrict" }),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
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
