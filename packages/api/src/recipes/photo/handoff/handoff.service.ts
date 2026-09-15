import { randomBytes } from "node:crypto";
import {
	HANDOFF_LINK_TTL_MS,
	HANDOFF_RESULT_GRACE_MS,
} from "@bespoke/domain/photoHandoff/constants";
import { z } from "zod";
import { type HandoffQr, renderHandoffQr } from "./handoffQr";
import {
	HANDOFF_CLOSED,
	type HandoffRecord,
	type HandoffStore,
	handoffStore,
} from "./handoffStore";

/** 16 random bytes as base64url. */
export const handoffNonceSchema = z.string().regex(/^[A-Za-z0-9_-]{22}$/);

export type HandoffPhase = "pending" | "opened" | "done" | "closed" | "expired";

/** A missing record counts as expired. */
export type HandoffEndedReason = "expired" | "closed";

export class HandoffError extends Error {
	constructor(
		public readonly code: "forbidden" | "unavailable",
		message: string,
	) {
		super(message);
		this.name = "HandoffError";
	}
}

function requireStore(): HandoffStore {
	if (!handoffStore) {
		throw new HandoffError("unavailable", "Handoff is not configured");
	}
	return handoffStore;
}

function graceEnd(record: Pick<HandoffRecord, "expiresAt">): number {
	return record.expiresAt + HANDOFF_RESULT_GRACE_MS;
}

export function isHandoffAvailable(): boolean {
	return handoffStore !== null;
}

export function handoffUrl(origin: string, nonce: string): string {
	return `${origin}/handoff/${nonce}`;
}

export type MintedHandoff = {
	nonce: string;
	url: string;
	/** Epoch ms. */
	expiresAt: number;
	qr: HandoffQr;
};

/** Auth, consent and quota are checked by the caller. */
export async function mintHandoff(
	{ orgId, userId, origin }: { orgId: string; userId: string; origin: string },
	{ nowMs = Date.now() }: { nowMs?: number } = {},
): Promise<MintedHandoff> {
	const store = requireStore();
	const nonce = randomBytes(16).toString("base64url");
	const expiresAt = nowMs + HANDOFF_LINK_TTL_MS;

	await store.create(
		nonce,
		{ orgId, userId, expiresAt },
		{ expireAtMs: expiresAt + HANDOFF_RESULT_GRACE_MS },
	);

	const url = handoffUrl(origin, nonce);

	return { nonce, url, expiresAt, qr: renderHandoffQr(url) };
}

export type InspectHandoffResult =
	| { ok: true; record: HandoffRecord }
	| { ok: false; reason: HandoffEndedReason };

/** Read-only, so it's safe to call on page render. */
export async function inspectHandoff(
	nonce: string,
	{ nowMs = Date.now() }: { nowMs?: number } = {},
): Promise<InspectHandoffResult> {
	if (!handoffStore || !handoffNonceSchema.safeParse(nonce).success) {
		return { ok: false, reason: "expired" };
	}

	const record = await handoffStore.read(nonce);
	if (!record || nowMs >= record.expiresAt) {
		return { ok: false, reason: "expired" };
	}
	if (record.result !== null) {
		return { ok: false, reason: "closed" };
	}

	return { ok: true, record };
}

export async function openHandoff(
	nonce: string,
	{ nowMs = Date.now() }: { nowMs?: number } = {},
): Promise<InspectHandoffResult> {
	const inspected = await inspectHandoff(nonce, { nowMs });
	if (!inspected.ok) {
		return inspected;
	}

	await requireStore().markOpened(nonce, {
		nowMs,
		expireAtMs: graceEnd(inspected.record),
	});

	return inspected;
}

export type HandoffStatus =
	| { phase: Exclude<HandoffPhase, "done"> }
	| { phase: "done"; extractedText: string };

async function readForDesktop(
	nonce: string,
	orgId: string,
): Promise<HandoffRecord | null> {
	const record = await requireStore().read(nonce);
	if (record && record.orgId !== orgId) {
		throw new HandoffError(
			"forbidden",
			"This Handoff belongs to another Organisation",
		);
	}

	return record;
}

export async function readHandoffStatus(
	nonce: string,
	orgId: string,
	{ nowMs = Date.now() }: { nowMs?: number } = {},
): Promise<HandoffStatus> {
	const record = await readForDesktop(nonce, orgId);
	if (!record) {
		return { phase: "expired" };
	}
	if (record.result === HANDOFF_CLOSED) {
		return { phase: "closed" };
	}
	if (record.result) {
		return { phase: "done", extractedText: record.result.extractedText };
	}
	if (record.openedAt !== null) {
		return { phase: nowMs >= graceEnd(record) ? "expired" : "opened" };
	}

	return { phase: nowMs >= record.expiresAt ? "expired" : "pending" };
}

export async function closeHandoff(
	nonce: string,
	orgId: string,
): Promise<{ closed: boolean }> {
	const record = await readForDesktop(nonce, orgId);
	if (!record) {
		return { closed: false };
	}

	const closed = await requireStore().close(nonce, {
		expireAtMs: graceEnd(record),
	});

	return { closed };
}
