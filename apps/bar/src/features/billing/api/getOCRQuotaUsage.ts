import { db } from "@bespoke/db";
import { cacheLife, cacheTag } from "next/cache";
import {
	getOCRUsageInWindow,
	type OCRQuotaUsage,
} from "@/features/billing/api/getOCRUsageInWindow";
import { cacheTags } from "@/utils/cache";

export async function getCachedOCRQuotaUsage(
	orgId: string,
): Promise<OCRQuotaUsage> {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.ocrQuotaUsage(orgId));
	return await getOCRUsageInWindow(db, orgId);
}
