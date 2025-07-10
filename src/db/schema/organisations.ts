import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const OrganisationsTable = pgTable("organisations", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid(10)),
	clerkOrgId: text("clerk_org_id").notNull().unique(),
	currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
	defaultLocale: varchar("default_locale", { length: 10 })
		.notNull()
		.default("en-GB"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	createdBy: text("created_by").notNull(),
});

export type Organisation = typeof OrganisationsTable.$inferSelect;
