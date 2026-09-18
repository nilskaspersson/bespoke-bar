import { AppError } from "@bespoke/schema/appError";
import { rateLimit } from "../../../rateLimit";
import {
	type ParsePhotoResult,
	parsePhotoWithQuota,
} from "../parsePhotoWithQuota.service";
import { type HandoffEndedReason, inspectHandoff } from "./handoff.service";
import { handoffStore } from "./handoffStore";

export type SubmitHandoffPhotoResult =
	| { status: 200; body: { ok: true } }
	| {
			status: 410;
			body: {
				ok: false;
				reason: HandoffEndedReason;
				error: { message: string };
			};
	  }
	| Exclude<ParsePhotoResult, { status: 200 }>;

const ENDED_MESSAGE: Record<HandoffEndedReason, string> = {
	expired: "This link has expired. Start a new handoff on your desktop.",
	closed: "This handoff has ended. Start a new one on your desktop.",
};

function ended(reason: HandoffEndedReason): SubmitHandoffPhotoResult {
	return {
		status: 410,
		body: { ok: false, reason, error: { message: ENDED_MESSAGE[reason] } },
	};
}

/**
 * Checking up front avoids spending a Use when the desktop already closed the
 * handoff. If it closes while Vision is running the Use still counts (a Use is
 * any Vision 2xx) and the text is dropped.
 */
export async function submitHandoffPhoto(
	nonce: string,
	formData: FormData,
	{ nowMs = Date.now() }: { nowMs?: number } = {},
): Promise<SubmitHandoffPhotoResult> {
	const store = handoffStore;
	const inspected = await inspectHandoff(nonce, { nowMs });
	if (!inspected.ok) {
		return ended(inspected.reason);
	}
	if (!store) {
		return ended("expired");
	}

	const { record } = inspected;

	try {
		await rateLimit(record.userId);
	} catch (error) {
		if (error instanceof AppError) {
			return { status: 429, body: { ok: false, error: error.payload } };
		}
		throw error;
	}

	const parsed = await parsePhotoWithQuota(
		{ orgId: record.orgId, userId: record.userId },
		formData,
	);
	if (parsed.status !== 200) {
		return parsed;
	}

	const claimed = await store.claimResult(nonce, {
		extractedText: parsed.body.data.extractedText,
	});
	if (!claimed) {
		return ended("closed");
	}

	return { status: 200, body: { ok: true } };
}
