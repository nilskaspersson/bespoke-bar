import { relations, sql } from "drizzle-orm";
import {
	check,
	pgTable,
	real,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { z } from "zod/v4";
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
		ingredient: varchar("ingredient", { length: 100 }).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		check(
			"quantity_null_or_positive",
			sql`${table.quantity} IS NULL OR ${table.quantity} > 0`,
		),
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
export type UserInputSpec = Identity<
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
