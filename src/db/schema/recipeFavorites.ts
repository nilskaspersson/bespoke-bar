import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { RecipesTable } from "@/db/schema/recipes";

export const RecipeFavoritesTable = pgTable(
	"recipe_favorites",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid(10)),
		recipeId: text("recipe_id")
			.notNull()
			.references(() => RecipesTable.id, { onDelete: "cascade" }),
		userId: text("user_id").notNull(),
		orgId: text("org_id").notNull(),
		addedAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		unique("recipe_favorites_user_recipe_unique").on(
			table.userId,
			table.recipeId,
		),
		index("idx_recipe_favorites_user_org").on(table.orgId, table.userId),
		index("idx_recipe_favorites_recipe").on(table.recipeId),
	],
);

export const recipeFavoritesRelations = relations(
	RecipeFavoritesTable,
	({ one }) => ({
		recipe: one(RecipesTable, {
			fields: [RecipeFavoritesTable.recipeId],
			references: [RecipesTable.id],
		}),
	}),
);

export type RecipeFavorite = typeof RecipeFavoritesTable.$inferSelect;
export type InsertRecipeFavorite = typeof RecipeFavoritesTable.$inferInsert;
