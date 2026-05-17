import { relations, sql } from "drizzle-orm";
import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import z from "zod";
import { OrganisationsTable } from "@/db/schema/organisations";
import { RecipeListEntriesTable } from "@/db/schema/recipeListEntries";
import { sqlNormalizedString } from "@/db/utils";

export const RecipeListsTable = pgTable(
	"recipe_lists",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid(10)),
		name: varchar("name", { length: 100 }).notNull(),
		description: varchar("description", { length: 1000 }),
		isPublic: boolean("is_public").default(false).notNull(),
		isFeatured: boolean("is_featured").default(false).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		createdBy: text("created_by").notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }),
		updatedBy: text("updated_by"),
		featuredAt: timestamp("featured_at", { mode: "string" }),
		orgId: text("org_id")
			.notNull()
			.references(() => OrganisationsTable.id, { onDelete: "cascade" }),
	},
	(table) => [
		uniqueIndex("unique_list_name_case_insensitive").on(
			table.orgId,
			sqlNormalizedString(table.name),
		),
		index("idx_lists_org_activity").on(
			table.orgId,
			sql`COALESCE(${table.updatedAt}, ${table.createdAt}) DESC`,
		),
		index("idx_lists_featured_org").on(table.orgId, table.isFeatured),
		index("idx_lists_org_public").on(table.orgId, table.isPublic),
	],
);

export const listsRelations = relations(RecipeListsTable, ({ many }) => ({
	entries: many(RecipeListEntriesTable),
}));

export const selectRecipeListSchema = createSelectSchema(RecipeListsTable);
export const insertRecipeListSchema = createInsertSchema(RecipeListsTable);

export type RecipeList = typeof RecipeListsTable.$inferSelect;

export type InsertRecipeList = Omit<
	typeof RecipeListsTable.$inferInsert,
	| "id"
	| "createdAt"
	| "updatedAt"
	| "createdBy"
	| "orgId"
	| "featuredAt"
	| "isFeatured"
>;

export type UpdateRecipeList = Pick<
	typeof RecipeListsTable.$inferInsert,
	"name" | "description" | "isPublic" | "updatedAt" | "updatedBy"
>;

export const recipeListFormSchema = insertRecipeListSchema
	.pick({
		id: true,
		name: true,
		description: true,
		isPublic: true,
	})
	.extend({
		name: z.string().optional(),
	})
	.refine((data) => data.id || data.name, {
		message: "Select a list or provide a new list name",
		path: ["name"],
	});

export type RecipeListFormData = z.infer<typeof recipeListFormSchema>;
