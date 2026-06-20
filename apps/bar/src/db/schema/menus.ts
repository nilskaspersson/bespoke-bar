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
import { MenuEntriesTable } from "@/db/schema/menuEntries";
import { OrganisationsTable } from "@/db/schema/organisations";
import { sqlNormalizedString } from "@/db/utils";

export const MenusTable = pgTable(
	"menus",
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
		uniqueIndex("unique_menu_name_case_insensitive").on(
			table.orgId,
			sqlNormalizedString(table.name),
		),
		index("idx_menus_org_activity").on(
			table.orgId,
			sql`COALESCE(${table.updatedAt}, ${table.createdAt}) DESC`,
		),
		index("idx_menus_featured_org").on(table.orgId, table.isFeatured),
		index("idx_menus_org_public").on(table.orgId, table.isPublic),
	],
);

export const menusRelations = relations(MenusTable, ({ many }) => ({
	entries: many(MenuEntriesTable),
}));

export const selectMenuSchema = createSelectSchema(MenusTable);
export const insertMenuSchema = createInsertSchema(MenusTable);

export type Menu = typeof MenusTable.$inferSelect;

export type InsertMenu = Omit<
	typeof MenusTable.$inferInsert,
	| "id"
	| "createdAt"
	| "updatedAt"
	| "createdBy"
	| "orgId"
	| "featuredAt"
	| "isFeatured"
>;

export type UpdateMenu = Pick<
	typeof MenusTable.$inferInsert,
	"name" | "description" | "isPublic" | "updatedAt" | "updatedBy"
>;

export const menuFormSchema = insertMenuSchema
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
		message: "Select a menu or provide a new menu name",
		path: ["name"],
	});

export type MenuFormData = z.infer<typeof menuFormSchema>;
