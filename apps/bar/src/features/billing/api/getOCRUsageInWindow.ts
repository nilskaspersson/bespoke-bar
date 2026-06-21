import { OCRQuotaUsesTable } from "@bespoke/schema/schema/ocrQuotaUses";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import type { DatabaseExecutor } from "@/db";

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
 * `now() AT TIME ZONE 'UTC'` pins the boundary to UTC regardless of the DB
 * session timezone, matching the `timestamp without time zone` column and the
 * app-side `startOfCurrentUTCMonthMs` sentinel. The contract is self-enforcing,
 * not inherited from a Neon/Vercel session default.
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
					sql`date_trunc('month', now() AT TIME ZONE 'UTC')`,
				),
			),
		);

	return ocrQuotaUsageSchema.parse(row);
}
