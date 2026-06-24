import { db } from "@bespoke/db";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "../cache";
import { getOCRUsageInWindow, type OCRQuotaUsage } from "./getOCRUsageInWindow";

export async function getCachedOCRQuotaUsage(
	orgId: string,
): Promise<OCRQuotaUsage> {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.ocrQuotaUsage(orgId));
	return await getOCRUsageInWindow(db, orgId);
}
