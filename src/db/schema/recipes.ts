import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { SpecsTable } from "@/db/schema/specs";

export const RecipesTable = pgTable("recipes", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid(10)),
	name: varchar("name", { length: 100 }),
	description: varchar("description", { length: 500 }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at"),
	createdBy: text("created_by").notNull(), // Clerk userId
	ownerId: text("owner_id"), // Clerk userId or orgId
});

export const recipesRelations = relations(RecipesTable, ({ many }) => ({
	specs: many(SpecsTable),
}));

export type Recipe = typeof RecipesTable.$inferSelect;

export type NewRecipe = Omit<
	typeof RecipesTable.$inferInsert,
	"id" | "createdAt"
>;
