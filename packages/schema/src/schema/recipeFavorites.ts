import { relations } from "drizzle-orm";
import { index, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { createdAtCol, orgIdCascade } from "./columns";
import { RecipesTable } from "./recipes";

export const RecipeFavoritesTable = pgTable(
	"recipe_favorites",
	{
		recipeId: text("recipe_id")
			.notNull()
			.references(() => RecipesTable.id, { onDelete: "cascade" }),
		userId: text("user_id").notNull(),
		orgId: orgIdCascade(),
		addedAt: createdAtCol(),
	},
	(table) => [
		primaryKey({ columns: [table.orgId, table.userId, table.recipeId] }),
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
