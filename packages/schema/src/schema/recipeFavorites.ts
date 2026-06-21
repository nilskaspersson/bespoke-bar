import { relations } from "drizzle-orm";
import {
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { OrganisationsTable } from "./organisations";
import { RecipesTable } from "./recipes";

export const RecipeFavoritesTable = pgTable(
	"recipe_favorites",
	{
		recipeId: text("recipe_id")
			.notNull()
			.references(() => RecipesTable.id, { onDelete: "cascade" }),
		userId: text("user_id").notNull(),
		orgId: text("org_id")
			.notNull()
			.references(() => OrganisationsTable.id, { onDelete: "cascade" }),
		addedAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
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
