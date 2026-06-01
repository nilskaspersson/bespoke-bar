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

export const SpecsTable = pgTable(
	"specs",
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
		index("idx_specs_ingredient").on(table.ingredientId),
		index("idx_specs_recipe_ingredient").on(table.recipeId, table.ingredientId),
	],
);

export const specsRelations = relations(SpecsTable, ({ one }) => ({
	recipe: one(RecipesTable, {
		fields: [SpecsTable.recipeId],
		references: [RecipesTable.id],
	}),
	ingredient: one(IngredientsTable, {
		fields: [SpecsTable.ingredientId],
		references: [IngredientsTable.id],
	}),
}));

export type Spec = typeof SpecsTable.$inferSelect;

export type InsertSpec = Omit<
	typeof SpecsTable.$inferInsert,
	"id" | "createdAt"
>;

/**
 * The fields users can provide to create a spec.
 */
export type DraftSpec = Identity<
	Partial<Pick<Spec, "quantity" | "unit" | "ingredientId" | "optional">>
>;

export type SpecWithIngredient = Spec & {
	ingredient: Ingredient;
};

export type DraftSpecWithDraftIngredient = DraftSpec & {
	ingredient: Partial<Ingredient>;
};

const specsConstraintsSchema = {
	quantity: z.coerce.number().positive().nullable(),
};

export const insertSpecsSchema = createInsertSchema(SpecsTable).extend(
	specsConstraintsSchema,
);
