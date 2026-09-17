import { db } from "@bespoke/db";
import { OCR_QUOTA_USE_RETENTION_DAYS } from "@bespoke/domain/billing/constants";
import { ocrQuotaReachedPayload } from "@bespoke/domain/billing/ocrQuotaReached";
import { AppError, type AppErrorPayload } from "@bespoke/schema/appError";
import { OCRQuotaUsesTable } from "@bespoke/schema/schema/ocrQuotaUses";
import { and, eq, lt, sql } from "drizzle-orm";
import { after } from "next/server";
import { getCachedOCRQuotaState } from "../../billing/getOCRQuotaState";
import { recordOCRUse, refundOCRUse } from "../../billing/recordOCRUse.service";
import { cacheEvents } from "../../cache";
import { parseTextFromImageService } from "./parseTextFromImage.service";

export type ParsedPhoto = Awaited<ReturnType<typeof parseTextFromImageService>>;

export type ParsePhotoResult =
	| { status: 200; body: { ok: true; data: ParsedPhoto } }
	| {
			status: 400 | 422 | 429;
			body: { ok: false; error: AppErrorPayload | { message: string } };
	  };

/** Prunes old Uses (ADR 0001) after the response has been sent. */
function pruneExpiredUses(orgId: string) {
	after(async () => {
		await db
			.delete(OCRQuotaUsesTable)
			.where(
				and(
					eq(OCRQuotaUsesTable.orgId, orgId),
					lt(
						OCRQuotaUsesTable.createdAt,
						sql`now() - make_interval(days => ${OCR_QUOTA_USE_RETENTION_DAYS}::int)`,
					),
				),
			);
	});
}

function settleUse(orgId: string) {
	cacheEvents.ocrQuotaUse.changed.emit(orgId);
	pruneExpiredUses(orgId);
}

/**
 * Quota check, Use record, Vision + LLM, and a refund on failure. Auth is up to
 * the caller.
 */
export async function parsePhotoWithQuota(
	{ orgId, userId }: { orgId: string; userId: string },
	formData: FormData,
): Promise<ParsePhotoResult> {
	/**
	 * Cheap early exit off the cached state. It can be off by a Use, which is
	 * fine; `recordOCRUse` does the real check.
	 */
	const state = await getCachedOCRQuotaState(orgId);
	if (state.remaining <= 0) {
		return {
			status: 429,
			body: { ok: false, error: ocrQuotaReachedPayload(state) },
		};
	}

	let useId: string;
	try {
		({ useId } = await recordOCRUse({ orgId, userId }));
	} catch (error) {
		if (error instanceof AppError) {
			return { status: 429, body: { ok: false, error: error.payload } };
		}
		throw error;
	}

	try {
		const data = await parseTextFromImageService(formData);
		settleUse(orgId);

		return { status: 200, body: { ok: true, data } };
	} catch (error) {
		/**
		 * NO_RECIPE_FOUND means Vision answered, so the Use counts (see CONTEXT).
		 * Anything else failed before that, so the Use is refunded.
		 */
		if (error instanceof AppError && error.payload.code === "NO_RECIPE_FOUND") {
			settleUse(orgId);

			return { status: 422, body: { ok: false, error: error.payload } };
		}

		await refundOCRUse(useId, orgId);
		cacheEvents.ocrQuotaUse.changed.emit(orgId);

		const message =
			error instanceof Error ? error.message : "Failed to parse image";

		return { status: 400, body: { ok: false, error: { message } } };
	}
}
