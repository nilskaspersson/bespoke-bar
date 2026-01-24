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
import { z } from "zod";
import { RecipeListsTable } from "@/db/schema/recipeLists";
import { RecipesTable, type RecipeWithSpecs } from "@/db/schema/recipes";

export const RecipeListEntriesTable = pgTable(
	"recipe_list_entries",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid(10)),
		orgId: text("org_id").notNull(),
		listId: text("list_id")
			.notNull()
			.references(() => RecipeListsTable.id, { onDelete: "cascade" }),
		recipeId: text("recipe_id")
			.notNull()
			.references(() => RecipesTable.id, { onDelete: "cascade" }),
		sortOrder: integer("sort_order"),
		price: real("price"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at"),
	},
	(table) => [
		index("idx_recipe_list_entries_org").on(table.orgId),
		index("idx_recipe_list_entries_org_list").on(table.orgId, table.listId),
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

export type InsertRecipeListEntry = Omit<
	typeof RecipeListEntriesTable.$inferInsert,
	"id"
>;

export type UpdateRecipeListEntry = Pick<
	typeof RecipeListEntriesTable.$inferInsert,
	"sortOrder" | "price" | "recipeId" | "listId"
>;

export type RecipeListEntryWithRecipe = RecipeListEntry & {
	recipe: RecipeWithSpecs;
};

export const selectRecipeListEntrySchema = createSelectSchema(
	RecipeListEntriesTable,
);

export const insertRecipeListEntrySchema = createInsertSchema(
	RecipeListEntriesTable,
);

export const updateRecipeListEntrySchema = createUpdateSchema(
	RecipeListEntriesTable,
);

export const recipeListEntryFormSchema = insertRecipeListEntrySchema
	.pick({
		price: true,
		listId: true,
		recipeId: true,
		sortOrder: true,
	})
	.extend({
		listId: z.string({ message: "Select a list" }),
	})
	.partial({
		price: true,
		sortOrder: true,
	});

export type RecipeListEntryFormData = z.infer<typeof recipeListEntryFormSchema>;
