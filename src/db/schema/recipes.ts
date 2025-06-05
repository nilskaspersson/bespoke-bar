import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { type Spec, SpecsTable } from "@/db/schema/specs";
import type { Identity } from "@/utils/types";

export const RecipesTable = pgTable("recipes", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid(10)),
	name: varchar("name", { length: 100 }),
	description: varchar("description", { length: 500 }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at"),
	createdBy: text("created_by").notNull(), // Clerk userId
	orgId: text("org_id"), // Clerk orgId
});

export const recipesRelations = relations(RecipesTable, ({ many }) => ({
	specs: many(SpecsTable),
}));

export type Recipe = typeof RecipesTable.$inferSelect;

export type RecipeWithSpecs = Recipe & {
	specs: Spec[];
};

export type InsertRecipe = Omit<
	typeof RecipesTable.$inferInsert,
	"id" | "createdAt"
>;

/**
 * The fields users can provide to create a recipe.
 */
export type UserInputRecipe = Identity<
	Partial<Pick<Recipe, "name" | "description">>
>;
