import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { OrganisationsTable } from "./organisations";

export const OCRQuotaUsesTable = pgTable(
	"ocr_quota_uses",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid(10)),
		orgId: text("org_id")
			.notNull()
			.references(() => OrganisationsTable.id, { onDelete: "cascade" }),
		userId: text("user_id").notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(t) => [
		index("ocr_quota_uses_org_id_created_at_idx").on(
			t.orgId,
			t.createdAt.desc(),
		),
	],
);

export type OCRQuotaUse = typeof OCRQuotaUsesTable.$inferSelect;
export type InsertOCRQuotaUse = typeof OCRQuotaUsesTable.$inferInsert;
