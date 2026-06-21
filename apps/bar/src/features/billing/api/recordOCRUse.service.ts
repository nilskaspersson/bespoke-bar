import { startOfNextUTCMonthMs } from "@bespoke/domain/billing/quotaMonth";
import { OCRQuotaUsesTable } from "@bespoke/schema/schema/ocrQuotaUses";
import { OrganisationsTable } from "@bespoke/schema/schema/organisations";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { getOCRQuotaLimit } from "@/features/billing/api/getOCRQuotaLimit";
import { getOCRUsageInWindow } from "@/features/billing/api/getOCRUsageInWindow";
import { AppError } from "@/utils/appError";

/**
 * The quota ceiling is read outside the lock: grants move rarely, so a stale
 * ceiling at worst mis-gates by a single Use, and keeping it out of the
 * transaction avoids a second pooled connection while the row lock is held. The
 * lock spans only the count and the insert — never the ceiling lookup or the
 * Vision call — serialising concurrent Uses for the same org so two requests
 * can't both pass off a stale count. Returns the moment the row commits and does
 * no further work, so the caller always receives the `useId` and can refund it
 * if delivery then fails; cache invalidation is the caller's job (see
 * `/api/photo/parse`).
 */
export async function recordOCRUse({
	orgId,
	userId,
}: {
	orgId: string;
	userId: string;
}): Promise<{ useId: string }> {
	const limit = await getOCRQuotaLimit(orgId);

	const useId = await db.transaction(async (tx) => {
		await tx
			.select({ id: OrganisationsTable.id })
			.from(OrganisationsTable)
			.where(eq(OrganisationsTable.id, orgId))
			.for("update");

		const { used } = await getOCRUsageInWindow(tx, orgId);

		if (used >= limit) {
			const nowMs = Date.now();
			const retryAfter = Math.max(
				1,
				Math.ceil((startOfNextUTCMonthMs(nowMs) - nowMs) / 1000),
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
 * Only meaningful inside the retention window (ADR 0001), which a same-request
 * refund always satisfies.
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
