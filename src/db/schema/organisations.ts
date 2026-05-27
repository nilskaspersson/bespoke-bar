import {
	integer,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import type z from "zod";

export const DEFAULT_BASE_RECIPE_SLOTS = 50;
export const DEFAULT_BASE_OCR_QUOTA = 3;

export const OrganisationsTable = pgTable("organisations", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid(10)),
	clerkOrgId: text("clerk_org_id").notNull().unique(),
	currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
	defaultLocale: varchar("default_locale", { length: 10 })
		.notNull()
		.default("en-GB"),
	baseRecipeSlots: integer("base_recipe_slots")
		.notNull()
		.default(DEFAULT_BASE_RECIPE_SLOTS),
	baseOCRQuota: integer("base_ocr_quota")
		.notNull()
		.default(DEFAULT_BASE_OCR_QUOTA),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
	createdBy: text("created_by").notNull(),
});

export type Organisation = typeof OrganisationsTable.$inferSelect;
export type InsertOrganisation = typeof OrganisationsTable.$inferInsert;

export const readOrganisationSchema = createSelectSchema(OrganisationsTable);
export const updateOrganisationSchema = createUpdateSchema(OrganisationsTable);

export const updateOrganisationFormSchema = updateOrganisationSchema.pick({
	currency: true,
	defaultLocale: true,
});

export type UpdateOrganisationFormData = z.infer<
	typeof updateOrganisationFormSchema
>;
