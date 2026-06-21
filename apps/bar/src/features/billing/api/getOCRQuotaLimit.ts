import { db } from "@bespoke/db";
import { PRO_OCR_QUOTA_BONUS } from "@bespoke/domain/billing/constants";
import { OCRQuotaGrantsTable } from "@bespoke/schema/schema/ocrQuotaGrants";
import {
	DEFAULT_BASE_OCR_QUOTA,
	OrganisationsTable,
} from "@bespoke/schema/schema/organisations";
import { isProActive } from "@bespoke/schema/schema/orgSubscriptions";
import { eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getOrgSubscription } from "@/features/billing/api/getOrgSubscription";
import { cacheTags } from "@/utils/cache";

export async function getOCRQuotaLimit(orgId: string): Promise<number> {
	const [[org], [grants], subscription] = await Promise.all([
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
		getOrgSubscription(orgId),
	]);

	const base = org?.baseOCRQuota ?? DEFAULT_BASE_OCR_QUOTA;
	const proBonus = isProActive(subscription?.status) ? PRO_OCR_QUOTA_BONUS : 0;
	return base + (grants?.total ?? 0) + proBonus;
}

export async function getCachedOCRQuotaLimit(orgId: string): Promise<number> {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.ocrQuotaLimit(orgId));
	return await getOCRQuotaLimit(orgId);
}
