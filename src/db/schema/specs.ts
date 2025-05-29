import { relations } from "drizzle-orm";
import {
	pgEnum,
	pgTable,
	real,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { RecipesTable } from "@/db/schema/recipes";

/**
 * These are some of the volume units from `convert-units`. We are likely going to
 * want to extend this to include "oz" as a common shorthand for "fl-oz". We are
 * likely going to want to add things like "barspoon" and "dash" as custom units.
 */
export const unitEnum = pgEnum("unit", [
	"fl-oz",
	"cup",
	"pnt",
	"l",
	"ml",
	"cl",
	"tsp",
	"Tbs",
]);

export const SpecsTable = pgTable("specs", {
	id: serial("id").primaryKey(),
	recipeId: text("recipe_id")
		.notNull()
		.references(() => RecipesTable.id, { onDelete: "cascade" }),
	quantity: real("quantity"),
	unit: unitEnum("unit"),
	ingredient: varchar("ingredient", { length: 100 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const specsRelations = relations(SpecsTable, ({ one }) => ({
	recipe: one(RecipesTable, {
		fields: [SpecsTable.recipeId],
		references: [RecipesTable.id],
	}),
}));
