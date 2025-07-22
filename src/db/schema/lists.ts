import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { nanoid } from "nanoid";
import {
	RecipeListEntriesTable,
	type RecipeListEntry,
} from "@/db/schema/recipeListEntries";
import type { Recipe } from "@/db/schema/recipes";
import { sqlNormalizedString } from "@/db/utils";

export const ListsTable = pgTable(
	"lists",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid(10)),
		name: varchar("name", { length: 100 }).notNull(),
		description: varchar("description", { length: 1000 }),
		isPublic: boolean("is_public").default(false).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		createdBy: text("created_by").notNull(),
		updatedAt: timestamp("updated_at"),
		updatedBy: text("updated_by"),
		orgId: text("org_id").notNull(),
	},
	(table) => [
		uniqueIndex("unique_list_name_case_insensitive").on(
			sqlNormalizedString(table.name),
			table.orgId,
		),
		index("idx_lists_org").on(table.orgId, table.createdAt.desc()),
		index("idx_lists_org_public").on(
			table.orgId,
			table.isPublic,
			table.createdAt.desc(),
		),
	],
);

export const listsRelations = relations(ListsTable, ({ many }) => ({
	entries: many(RecipeListEntriesTable),
}));

export type List = typeof ListsTable.$inferSelect;

export type ListWithRecipeCount = List & {
	recipeCount: number;
};

export type ListWithRecipes = List & {
	entries: (RecipeListEntry & {
		recipe: Recipe;
	})[];
};

export type InsertList = Omit<
	typeof ListsTable.$inferInsert,
	"id" | "createdAt" | "updatedAt" | "createdBy" | "orgId"
>;

export type UpdateList = Pick<
	typeof ListsTable.$inferInsert,
	"name" | "description" | "isPublic" | "updatedAt" | "updatedBy"
>;

export const selectListSchema = createSelectSchema(ListsTable);
export const insertListSchema = createInsertSchema(ListsTable);
export const updateListSchema = createUpdateSchema(ListsTable);
