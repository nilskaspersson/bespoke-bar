import { relations } from "drizzle-orm";
import {
	pgTable,
	real,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { RecipesTable } from "@/db/schema/recipes";
import { unitEnum } from "@/db/schema/units";

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

export type Spec = typeof SpecsTable.$inferSelect;

export type NewSpec = Omit<typeof SpecsTable.$inferInsert, "id" | "createdAt">;

/**
 * The fields users can provide to create a spec.
 */
export type UserInputSpec = Pick<Spec, "quantity" | "unit" | "ingredient">;
