import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { OCRQuotaUsesTable } from "@/db/schema/ocrQuotaUses";
import { OrganisationsTable } from "@/db/schema/organisations";
import { getOCRQuotaLimit } from "@/features/billing/api/getOCRQuotaLimit";
import {
	OCR_QUOTA_WINDOW_HOURS,
	OCR_QUOTA_WINDOW_MS,
} from "@/features/billing/constants";
import { AppError } from "@/utils/appError";

/**
 * Reserve a Photo-to-Recipe Use. In one transaction: row-lock the org (the
 * same serialisation point slot-limits uses), take a fresh windowed count,
 * check it against the live ceiling, and insert the Use. Returns as soon as the
 * row is committed and does no further work — so the caller always receives the
 * `useId` and can refund it if delivery then fails. Cache invalidation is the
 * caller's job (see `/api/photo/parse`); keeping the reservation free of any
 * post-commit step means nothing can strand a committed Use.
 *
 * The lock is held for ~1ms — never for the Vision call — and serialises
 * concurrent Uses for the same org, so two requests can't both pass off a stale
 * count.
 */
export async function recordOCRUse({
	orgId,
	userId,
}: {
	orgId: string;
	userId: string;
}): Promise<{ useId: string }> {
	const useId = await db.transaction(async (tx) => {
		await tx
			.select({ id: OrganisationsTable.id })
			.from(OrganisationsTable)
			.where(eq(OrganisationsTable.id, orgId))
			.for("update");

		const [usage] = await tx
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

		const used = usage?.used ?? 0;
		const limit = await getOCRQuotaLimit(orgId);

		if (used >= limit) {
			const oldestEpochMs =
				usage?.oldestEpochMs == null ? null : Number(usage.oldestEpochMs);
			const retryAfter =
				oldestEpochMs == null
					? 1
					: Math.max(
							1,
							Math.ceil(
								(oldestEpochMs + OCR_QUOTA_WINDOW_MS - Date.now()) / 1000,
							),
						);

			throw new AppError({
				code: "OCR_QUOTA_REACHED",
				limit,
				used,
				retryAfter,
			});
		}

		const [inserted] = await tx
			.insert(OCRQuotaUsesTable)
			.values({ orgId, userId })
			.returning({ id: OCRQuotaUsesTable.id });

		return inserted.id;
	});

	return { useId };
}

/**
 * Delete a reserved Use, scoped to `orgId` defensively. The endpoint calls this
 * to revert a Use whenever delivery fails; the caller emits the cache
 * invalidation. Only meaningful inside the 48h retention window (ADR 0001),
 * which a same-request refund always satisfies.
 */
export async function refundOCRUse(
	useId: string,
	orgId: string,
): Promise<void> {
	await db
		.delete(OCRQuotaUsesTable)
		.where(
			and(eq(OCRQuotaUsesTable.id, useId), eq(OCRQuotaUsesTable.orgId, orgId)),
		);
}
