import { index, pgTable, text } from "drizzle-orm/pg-core";
import { createdAtCol, nanoidPk, orgIdCascade } from "./columns";

export const OCRQuotaUsesTable = pgTable(
	"ocr_quota_uses",
	{
		id: nanoidPk(),
		orgId: orgIdCascade(),
		userId: text("user_id").notNull(),
		createdAt: createdAtCol(),
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
