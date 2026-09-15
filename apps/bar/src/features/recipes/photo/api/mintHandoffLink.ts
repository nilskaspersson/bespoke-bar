"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { getCachedOCRQuotaState } from "@bespoke/api/billing/getOCRQuotaState";
import { rateLimit } from "@bespoke/api/rateLimit";
import {
	type MintedHandoff,
	mintHandoff,
} from "@bespoke/api/recipes/photo/handoff/handoff.service";
import { ocrQuotaReachedPayload } from "@bespoke/domain/billing/ocrQuotaReached";
import { AppError } from "@bespoke/schema/appError";
import { headers } from "next/headers";
import { checkOCRConsent } from "@/features/consent/ocrConsent";
import { catchKnownErrors } from "@/utils/serverAction";

/**
 * Absolute URL on the same deployment. On previews this needs Deployment
 * Protection bypassed for `/handoff/*`.
 */
async function requestOrigin(): Promise<string> {
	const requestHeaders = await headers();
	const host =
		requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
	if (!host) {
		throw new Error("Cannot determine the request origin for a Handoff Link");
	}

	const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
	const proto =
		requestHeaders.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");

	return `${proto}://${host}`;
}

export async function mintHandoffLink() {
	return catchKnownErrors<MintedHandoff>(async () => {
		const { orgId, userId } = await authOrForbidden();

		await rateLimit(userId);

		/**
		 * The phone never shows a consent dialog, so it has to be settled before
		 * the QR appears.
		 */
		if (!(await checkOCRConsent())) {
			throw new AppError({ code: "OCR_CONSENT_REQUIRED" });
		}

		const state = await getCachedOCRQuotaState(orgId);
		if (state.remaining <= 0) {
			throw new AppError(ocrQuotaReachedPayload(state));
		}

		return mintHandoff({ orgId, userId, origin: await requestOrigin() });
	});
}
