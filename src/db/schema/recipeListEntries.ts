import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	real,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { nanoid } from "nanoid";
import { type RecipeList, RecipeListsTable } from "@/db/schema/recipeLists";
import { type Recipe, RecipesTable } from "@/db/schema/recipes";

export const RecipeListEntriesTable = pgTable(
	"recipe_list_entries",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid(10)),
		listId: text("list_id")
			.notNull()
			.references(() => RecipeListsTable.id, { onDelete: "cascade" }),
		recipeId: text("recipe_id")
			.notNull()
			.references(() => RecipesTable.id, { onDelete: "cascade" }),
		sortOrder: integer("sort_order").notNull(),
		price: real("price"),
		addedAt: timestamp("added_at").defaultNow().notNull(),
		addedBy: text("added_by").notNull(),
		updatedAt: timestamp("updated_at"),
		updatedBy: text("updated_by"),
	},
	(table) => [
		// A recipe can only appear once per list
		uniqueIndex("idx_recipe_list_entries_unique").on(
			table.listId,
			table.recipeId,
		),
		// All entries in a list
		index("idx_recipe_list_entries_list_order").on(
			table.listId,
			table.sortOrder,
		),
		// All lists a recipe belongs to
		index("idx_recipe_list_entries_recipe").on(table.recipeId),
	],
);

export const recipeListEntriesRelations = relations(
	RecipeListEntriesTable,
	({ one }) => ({
		list: one(RecipeListsTable, {
			fields: [RecipeListEntriesTable.listId],
			references: [RecipeListsTable.id],
		}),
		recipe: one(RecipesTable, {
			fields: [RecipeListEntriesTable.recipeId],
			references: [RecipesTable.id],
		}),
	}),
);

export type RecipeListEntry = typeof RecipeListEntriesTable.$inferSelect;

export type RecipeListEntryWithRecipe = RecipeListEntry & {
	recipe: Recipe;
};

export type RecipeListEntryWithList = RecipeListEntry & {
	list: RecipeList;
};

export type RecipeListEntryWithBoth = RecipeListEntry & {
	recipe: Recipe;
	list: RecipeList;
};

export type InsertRecipeListEntry = Omit<
	typeof RecipeListEntriesTable.$inferInsert,
	"id" | "addedAt" | "addedBy" | "updatedAt" | "updatedBy"
>;

export type UpdateRecipeListEntry = Pick<
	typeof RecipeListEntriesTable.$inferInsert,
	"sortOrder" | "price" | "updatedAt" | "updatedBy"
>;

export const selectRecipeListEntrySchema = createSelectSchema(
	RecipeListEntriesTable,
);
export const insertRecipeListEntrySchema = createInsertSchema(
	RecipeListEntriesTable,
);
export const updateRecipeListEntrySchema = createUpdateSchema(
	RecipeListEntriesTable,
);
