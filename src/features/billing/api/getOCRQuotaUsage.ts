import { and, eq, gt, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { OCRQuotaUsesTable } from "@/db/schema/ocrQuotaUses";
import { OCR_QUOTA_WINDOW_HOURS } from "@/features/billing/constants";
import { cacheTags } from "@/utils/cache";

export type OCRQuotaUsage = {
	used: number;
	/**
	 * ISO-8601 instant of the oldest Use still inside the rolling window, or
	 * null when there are none. Absolute (not a remaining-seconds duration) so it
	 * stays correct while this read is cached with `cacheLife("max")`. The
	 * composite state derives `nextAvailableAt` from it.
	 *
	 * `extract(epoch …)` reads the `timestamp without time zone` column at face
	 * value, so the instant is exact only when the DB session is UTC (true on
	 * Neon/Vercel). A non-UTC local dev DB skews only this displayed countdown —
	 * never enforcement, which is internally consistent under any fixed session
	 * timezone.
	 */
	oldestCountingUseAt: string | null;
};

export async function getOCRQuotaUsage(orgId: string): Promise<OCRQuotaUsage> {
	const [row] = await db
		.select({
			used: sql<number>`count(*)::int`,
			oldestEpochMs: sql<
				string | null
			>`(extract(epoch from min(${OCRQuotaUsesTable.createdAt})) * 1000)::bigint`,
		})
		.from(OCRQuotaUsesTable)
		.where(
			and(
				eq(OCRQuotaUsesTable.orgId, orgId),
				gt(
					OCRQuotaUsesTable.createdAt,
					sql`now() - make_interval(hours => ${OCR_QUOTA_WINDOW_HOURS}::int)`,
				),
			),
		);

	const oldestEpochMs =
		row?.oldestEpochMs == null ? null : Number(row.oldestEpochMs);

	return {
		used: row?.used ?? 0,
		oldestCountingUseAt:
			oldestEpochMs == null ? null : new Date(oldestEpochMs).toISOString(),
	};
}

export async function getCachedOCRQuotaUsage(
	orgId: string,
): Promise<OCRQuotaUsage> {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.ocrQuotaUsage(orgId));
	return await getOCRQuotaUsage(orgId);
}
