import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { grantLedgerColumns } from "./columns";

export const OCRQuotaGrantsTable = pgTable(
	"ocr_quota_grants",
	grantLedgerColumns(),
	(t) => [
		index("ocr_quota_grants_org_id_idx").on(t.orgId),
		uniqueIndex("ocr_quota_grants_external_id_uq").on(t.externalId),
	],
);

export type OCRQuotaGrant = typeof OCRQuotaGrantsTable.$inferSelect;
export type InsertOCRQuotaGrant = typeof OCRQuotaGrantsTable.$inferInsert;
