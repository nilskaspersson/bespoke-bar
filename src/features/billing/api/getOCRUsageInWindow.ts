import { and, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";
import type { DatabaseExecutor } from "@/db";
import { OCRQuotaUsesTable } from "@/db/schema/ocrQuotaUses";
import { OCR_QUOTA_WINDOW_HOURS } from "@/features/billing/constants";

/**
 * Windowed-Use tally. `oldestUseAtMs` is epoch ms — the raw form the gate's
 * countdown arithmetic wants; the client-facing ISO instant is derived from it
 * downstream in `deriveOCRQuotaState`. `z.coerce` absorbs the driver handing
 * back the `::bigint` epoch as a string (and `count` as int or bigint).
 * @public
 */
export const ocrQuotaUsageSchema = z.object({
	used: z.coerce.number().int(),
	oldestUseAtMs: z.coerce.number().nullable(),
});

export type OCRQuotaUsage = z.infer<typeof ocrQuotaUsageSchema>;

/**
 * The windowed-Use read shared by the cached projection (`getCachedOCRQuotaUsage`)
 * and the transactional gate (`recordOCRUse`), so the count a user sees and the
 * count enforcement runs against can never drift apart. Takes an executor so it
 * runs on the pooled `db` or inside a `for update` transaction.
 *
 * `extract(epoch …)` reads the `timestamp without time zone` column at face
 * value, so the instant is exact only when the DB session is UTC (true on
 * Neon/Vercel). A non-UTC local dev DB skews only the displayed countdown —
 * never enforcement, which is internally consistent under any fixed session
 * timezone.
 */
export async function getOCRUsageInWindow(
	executor: DatabaseExecutor,
	orgId: string,
): Promise<OCRQuotaUsage> {
	const [row] = await executor
		.select({
			used: sql<number>`count(*)::int`,
			oldestUseAtMs: sql<
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

	return ocrQuotaUsageSchema.parse(row ?? { used: 0, oldestUseAtMs: null });
}
