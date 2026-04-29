import { relations } from "drizzle-orm";
import {
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { RecipesTable } from "@/db/schema/recipes";
import { TagsTable } from "@/db/schema/tags";

export const RecipeTagsTable = pgTable(
	"recipe_tags",
	{
		recipeId: text("recipe_id")
			.notNull()
			.references(() => RecipesTable.id, { onDelete: "cascade" }),
		tagId: text("tag_id")
			.notNull()
			.references(() => TagsTable.id, { onDelete: "cascade" }),
		orgId: text("org_id").notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		/**
		 * Composite primary key encodes the (recipeId, tagId) uniqueness
		 * invariant directly and gives us a covering btree index for
		 * "what tags does this recipe have" lookups.
		 */
		primaryKey({ columns: [table.recipeId, table.tagId] }),
		/**
		 * Reverse lookup index on tagId. Serves "which recipes have this tag"
		 * filters and, more importantly, makes ON DELETE CASCADE fast when a
		 * tag is removed — Postgres does not auto-index FK columns.
		 */
		index("idx_recipe_tags_tag_recipe").on(table.tagId, table.recipeId),
	],
);

export const recipeTagsRelations = relations(RecipeTagsTable, ({ one }) => ({
	recipe: one(RecipesTable, {
		fields: [RecipeTagsTable.recipeId],
		references: [RecipesTable.id],
	}),
	tag: one(TagsTable, {
		fields: [RecipeTagsTable.tagId],
		references: [TagsTable.id],
	}),
}));

export type RecipeTag = typeof RecipeTagsTable.$inferSelect;
export type InsertRecipeTag = typeof RecipeTagsTable.$inferInsert;
