import { relations, sql } from "drizzle-orm";
import {
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
import { createdAtCol, nanoidPk, orgIdCascade } from "./columns";
import { RecipeTagsTable } from "./recipeTags";

export const TagsTable = pgTable(
	"tags",
	{
		id: nanoidPk(),
		orgId: orgIdCascade(),
		name: varchar("name", { length: 30 }).notNull(),
		createdAt: createdAtCol(),
		createdBy: text("created_by").notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }),
		updatedBy: text("updated_by"),
	},
	(table) => [
		/**
		 * Case-insensitive uniqueness within an org so users can't create both
		 * "Tiki" and "tiki" as separate tags.
		 */
		uniqueIndex("idx_tags_org_name_unique").on(
			table.orgId,
			sql`lower(${table.name})`,
		),
	],
);

export const tagsRelations = relations(TagsTable, ({ many }) => ({
	recipeTags: many(RecipeTagsTable),
}));

export type Tag = typeof TagsTable.$inferSelect;

export type InsertTag = Omit<
	typeof TagsTable.$inferInsert,
	"id" | "createdAt" | "updatedAt" | "createdBy" | "orgId"
>;

export const selectTagSchema = createSelectSchema(TagsTable);
export const insertTagSchema = createInsertSchema(TagsTable);
export const updateTagSchema = createUpdateSchema(TagsTable);
