import { and, eq, lt, sql } from "drizzle-orm";
import { after, type NextRequest } from "next/server";
import { db } from "@/db";
import { OCRQuotaUsesTable } from "@/db/schema/ocrQuotaUses";
import { getCachedOCRQuotaState } from "@/features/billing/api/getOCRQuotaState";
import {
	recordOCRUse,
	refundOCRUse,
} from "@/features/billing/api/recordOCRUse.service";
import { parseTextFromImageService } from "@/features/recipes/photo/api/parseTextFromImage.service";
import { errorMessageOrFallback } from "@/utils/api";
import { AppError } from "@/utils/appError";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

/**
 * Trim Uses past the 48h retention window (ADR 0001) after the response, so it
 * never delays the reply. Called on every path where the Use stands.
 */
function pruneExpiredUses(orgId: string) {
	after(async () => {
		await db
			.delete(OCRQuotaUsesTable)
			.where(
				and(
					eq(OCRQuotaUsesTable.orgId, orgId),
					lt(OCRQuotaUsesTable.createdAt, sql`now() - interval '48 hours'`),
				),
			);
	});
}

export async function POST(req: NextRequest) {
	const { orgId, userId } = await authOrForbidden();

	const formData = await req.formData();

	/**
	 * Optimistic pre-check off the cached state. May be stale by ±1 Use, which
	 * is fine — it only early-rejects the clearly-over-cap case. `recordOCRUse`
	 * is the authoritative gate.
	 */
	const state = await getCachedOCRQuotaState(orgId);
	if (state.remaining <= 0) {
		const retryAfter = state.nextAvailableAt
			? Math.max(
					1,
					Math.ceil(
						(new Date(state.nextAvailableAt).getTime() - Date.now()) / 1000,
					),
				)
			: 1;

		return Response.json(
			{
				ok: false,
				error: {
					code: "OCR_QUOTA_REACHED",
					limit: state.limit,
					used: state.used,
					retryAfter,
				},
			},
			{ status: 429 },
		);
	}

	let useId: string;
	try {
		({ useId } = await recordOCRUse({ orgId, userId }));
	} catch (error) {
		if (error instanceof AppError) {
			return Response.json(
				{ ok: false, error: error.payload },
				{ status: 429 },
			);
		}
		throw error;
	}

	try {
		const result = await parseTextFromImageService(formData);

		/**
		 * Recipe extracted — the Use stands. Invalidate the cached usage so later
		 * reads (next page load, the pre-check) reflect the new count, then trim
		 * the log post-response.
		 */
		cacheEvents.ocrQuotaUse.changed.emit(orgId);
		pruneExpiredUses(orgId);

		return Response.json({ ok: true, data: result });
	} catch (error) {
		/**
		 * A 2xx from Vision that held no recipe (NO_RECIPE_FOUND) still counts —
		 * the caller paid for the call (CONTEXT: a Use is any Vision 2xx,
		 * "regardless of whether text was extracted"). Every other failure happened
		 * before a 2xx — a bad file, or the Vision/SDK call itself — so the
		 * reservation is reverted.
		 */
		if (error instanceof AppError && error.payload.code === "NO_RECIPE_FOUND") {
			cacheEvents.ocrQuotaUse.changed.emit(orgId);
			pruneExpiredUses(orgId);

			return Response.json(
				{ ok: false, error: error.payload },
				{ status: 422 },
			);
		}

		await refundOCRUse(useId, orgId);
		cacheEvents.ocrQuotaUse.changed.emit(orgId);

		const message = errorMessageOrFallback(error, "Failed to parse image");
		return Response.json({ ok: false, error: { message } }, { status: 400 });
	}
}
