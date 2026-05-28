import { eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { OCRQuotaGrantsTable } from "@/db/schema/ocrQuotaGrants";
import {
	DEFAULT_BASE_OCR_QUOTA,
	OrganisationsTable,
} from "@/db/schema/organisations";
import { getProOCRQuotaBonus } from "@/features/billing/api/getProOCRQuotaBonus";
import { cacheTags } from "@/utils/cache";

/**
 * Effective OCR Quota ceiling: base + ledgered grants + live Pro bonus. The
 * org-row fallback is defensive only — the FK on `ocr_quota_grants.org_id`
 * guarantees the parent row exists for any org that already holds grants.
 */
export async function getOCRQuotaLimit(orgId: string): Promise<number> {
	const [[org], [grants], proBonus] = await Promise.all([
		db
			.select({ baseOCRQuota: OrganisationsTable.baseOCRQuota })
			.from(OrganisationsTable)
			.where(eq(OrganisationsTable.id, orgId)),
		db
			.select({
				total: sql<number>`coalesce(sum(${OCRQuotaGrantsTable.amount}), 0)::int`,
			})
			.from(OCRQuotaGrantsTable)
			.where(eq(OCRQuotaGrantsTable.orgId, orgId)),
		getProOCRQuotaBonus(orgId),
	]);

	const base = org?.baseOCRQuota ?? DEFAULT_BASE_OCR_QUOTA;
	return base + (grants?.total ?? 0) + proBonus;
}

export async function getCachedOCRQuotaLimit(orgId: string): Promise<number> {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.ocrQuotaLimit(orgId));
	return await getOCRQuotaLimit(orgId);
}
