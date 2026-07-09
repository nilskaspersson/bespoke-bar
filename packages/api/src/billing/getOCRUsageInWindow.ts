import type { DatabaseExecutor } from "@bespoke/db";
import { OCRQuotaUsesTable } from "@bespoke/schema/schema/ocrQuotaUses";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";

/**
 * `z.coerce` absorbs the driver handing back the `::bigint` epoch as a string
 * (and `count` as int or bigint).
 * @public
 */
export const ocrQuotaUsageSchema = z.object({
	used: z.coerce.number().int(),
	monthStartMs: z.coerce.number(),
});

export type OCRQuotaUsage = z.infer<typeof ocrQuotaUsageSchema>;

/**
 * The double `AT TIME ZONE 'UTC'` pins the month boundary to UTC regardless
 * of the DB session timezone: the inner one turns `now()` into UTC wall time
 * for `date_trunc`, the outer one re-stamps the truncated value as
 * `timestamptz` so the comparison against the `timestamptz` column never
 * falls back to a session-timezone coercion. Matches the app-side
 * `startOfCurrentUTCMonthMs` sentinel; self-enforcing, not inherited from a
 * Neon/Vercel session default.
 */
export async function getOCRUsageInWindow(
	executor: DatabaseExecutor,
	orgId: string,
): Promise<OCRQuotaUsage> {
	const [row] = await executor
		.select({
			used: sql<number>`count(*)::int`,
			monthStartMs: sql<string>`(extract(epoch from date_trunc('month', now() AT TIME ZONE 'UTC')) * 1000)::bigint`,
		})
		.from(OCRQuotaUsesTable)
		.where(
			and(
				eq(OCRQuotaUsesTable.orgId, orgId),
				gte(
					OCRQuotaUsesTable.createdAt,
					sql`date_trunc('month', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'`,
				),
			),
		);

	return ocrQuotaUsageSchema.parse(row);
}
