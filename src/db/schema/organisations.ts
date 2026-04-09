import { index, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import type z from "zod";

export const OrganisationsTable = pgTable(
	"organisations",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid(10)),
		clerkOrgId: text("clerk_org_id").notNull().unique(),
		currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
		defaultLocale: varchar("default_locale", { length: 10 })
			.notNull()
			.default("en-GB"),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		createdBy: text("created_by").notNull(),
	},
	(table) => [index("organisations_clerk_org_id_idx").on(table.clerkOrgId)],
);

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
