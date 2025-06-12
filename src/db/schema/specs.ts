import { relations, sql } from "drizzle-orm";
import {
	check,
	index,
	pgTable,
	real,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { z } from "zod/v4";
import { IngredientsTable } from "@/db/schema/ingredients";
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
		quantity: real("quantity"),
		unit: unitEnum("unit"),
		ingredient: text("ingredient")
			.notNull()
			.references(() => IngredientsTable.id, { onDelete: "restrict" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		check(
			"quantity_null_or_positive",
			sql`${table.quantity} IS NULL OR ${table.quantity} > 0`,
		),
		index("idx_specs_recipe").on(table.recipeId),
		index("idx_specs_ingredient").on(table.ingredient),
	],
);

export const specsRelations = relations(SpecsTable, ({ one }) => ({
	recipe: one(RecipesTable, {
		fields: [SpecsTable.recipeId],
		references: [RecipesTable.id],
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
	Partial<Pick<Spec, "quantity" | "unit" | "ingredient">>
>;

const specsConstraintsSchema = {
	quantity: z.coerce.number().positive().nullable(),
};

export const specsInsertSchema = createInsertSchema(SpecsTable).extend(
	specsConstraintsSchema,
);

export const specsUpdateSchema = createUpdateSchema(SpecsTable).extend(
	specsConstraintsSchema,
);
