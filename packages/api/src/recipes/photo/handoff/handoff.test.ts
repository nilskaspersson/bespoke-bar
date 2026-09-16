import {
	HANDOFF_LINK_TTL_MS,
	HANDOFF_RESULT_GRACE_MS,
} from "@bespoke/domain/photoHandoff/constants";
import { AppError } from "@bespoke/schema/appError";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeRedis } from "./handoffStore.testing";

const rateLimit = vi.fn();
vi.mock("../../../rateLimit", () => ({ rateLimit }));

const parsePhotoWithQuota = vi.fn();
vi.mock("../parsePhotoWithQuota.service", () => ({ parsePhotoWithQuota }));

/** Real store, fake Redis. */
const redis = createFakeRedis();
vi.mock("./handoffStore", async () => {
	const actual =
		await vi.importActual<typeof import("./handoffStore")>("./handoffStore");
	return { ...actual, handoffStore: actual.createHandoffStore(redis) };
});

const {
	closeHandoff,
	extendHandoff,
	HandoffError,
	inspectHandoff,
	mintHandoff,
	readHandoffStatus,
} = await import("./handoff.service");
const { submitHandoffPhoto } = await import("./submitHandoffPhoto.service");

const NOW = 1_700_000_000_000;
const EXPIRES_AT = NOW + HANDOFF_LINK_TTL_MS;
const PAST_GRACE = EXPIRES_AT + HANDOFF_RESULT_GRACE_MS;
const auth = { orgId: "org_1", userId: "user_1" };
const origin = "https://bar.example.com";
const formData = new FormData();
const data = { rawOcrText: "raw", extractedText: "Negroni\n30 ml gin" };

async function mint() {
	return mintHandoff({ ...auth, origin }, { nowMs: NOW });
}

beforeEach(() => {
	vi.clearAllMocks();
	redis.reset();
	rateLimit.mockResolvedValue(undefined);
	parsePhotoWithQuota.mockResolvedValue({
		status: 200,
		body: { ok: true, data },
	});
});

describe("mintHandoff", () => {
	it("writes the record the phone will act under, and derives url, expiry and QR", async () => {
		const minted = await mint();

		expect(minted.nonce).toMatch(/^[A-Za-z0-9_-]{22}$/);
		expect(minted.url).toBe(`${origin}/handoff/${minted.nonce}`);
		expect(minted.expiresAt).toBe(EXPIRES_AT);
		expect(minted.qr.size).toBeGreaterThan(0);
		expect(redis.expiries.get(`handoff:${minted.nonce}`)).toBe(
			Math.ceil(PAST_GRACE / 1000),
		);
		expect(
			await readHandoffStatus(minted.nonce, auth.orgId, { nowMs: NOW }),
		).toEqual({ phase: "pending" });
	});

	it("mints a fresh nonce every time", async () => {
		expect((await mint()).nonce).not.toBe((await mint()).nonce);
	});
});

describe("inspectHandoff (phone)", () => {
	it("reads a live Handoff with the record the phone acts under", async () => {
		const { nonce } = await mint();

		expect(await inspectHandoff(nonce, { nowMs: NOW })).toEqual({
			ok: true,
			record: { ...auth, expiresAt: EXPIRES_AT, result: null },
		});
	});

	it("reads unknown, malformed and expired nonces as expired, strictly", async () => {
		const { nonce } = await mint();

		expect(await inspectHandoff("x".repeat(22), { nowMs: NOW })).toEqual({
			ok: false,
			reason: "expired",
		});
		expect(await inspectHandoff("not a nonce", { nowMs: NOW })).toEqual({
			ok: false,
			reason: "expired",
		});
		expect(await inspectHandoff(nonce, { nowMs: EXPIRES_AT })).toEqual({
			ok: false,
			reason: "expired",
		});
	});

	it("reads a settled Handoff as closed", async () => {
		const { nonce } = await mint();
		await closeHandoff(nonce, auth.orgId);

		expect(await inspectHandoff(nonce, { nowMs: NOW })).toEqual({
			ok: false,
			reason: "closed",
		});
	});
});

describe("submitHandoffPhoto (phone)", () => {
	it("runs the pipeline for the record's org and user, then parks the text", async () => {
		const { nonce } = await mint();

		const res = await submitHandoffPhoto(nonce, formData, { nowMs: NOW });

		expect(res).toEqual({ status: 200, body: { ok: true } });
		expect(rateLimit).toHaveBeenCalledWith(auth.userId);
		expect(parsePhotoWithQuota).toHaveBeenCalledWith(auth, formData);
		expect(await readHandoffStatus(nonce, auth.orgId, { nowMs: NOW })).toEqual({
			phase: "done",
			extractedText: data.extractedText,
		});
	});

	it("refuses a second submission after a success without spending a Use", async () => {
		const { nonce } = await mint();
		await submitHandoffPhoto(nonce, formData, { nowMs: NOW });
		parsePhotoWithQuota.mockClear();

		const res = await submitHandoffPhoto(nonce, formData, { nowMs: NOW });

		expect(res.status).toBe(410);
		expect(res.body).toMatchObject({ reason: "closed" });
		expect(parsePhotoWithQuota).not.toHaveBeenCalled();
	});

	it("refuses a tombstoned Handoff before the Use", async () => {
		const { nonce } = await mint();
		await closeHandoff(nonce, auth.orgId);

		const res = await submitHandoffPhoto(nonce, formData, { nowMs: NOW });

		expect(res.body).toMatchObject({ reason: "closed" });
		expect(parsePhotoWithQuota).not.toHaveBeenCalled();
	});

	it("lets a failed attempt retry on the same Handoff", async () => {
		const { nonce } = await mint();
		parsePhotoWithQuota.mockResolvedValueOnce({
			status: 400,
			body: { ok: false, error: { message: "boom" } },
		});

		expect(
			(await submitHandoffPhoto(nonce, formData, { nowMs: NOW })).status,
		).toBe(400);
		expect(
			(await submitHandoffPhoto(nonce, formData, { nowMs: NOW })).status,
		).toBe(200);
	});

	it("discards a result that lands after the desktop closed during Vision", async () => {
		const { nonce } = await mint();
		parsePhotoWithQuota.mockImplementationOnce(async () => {
			await closeHandoff(nonce, auth.orgId);
			return { status: 200, body: { ok: true, data } };
		});

		const res = await submitHandoffPhoto(nonce, formData, { nowMs: NOW });

		expect(res.body).toMatchObject({ reason: "closed" });
		expect(await readHandoffStatus(nonce, auth.orgId, { nowMs: NOW })).toEqual({
			phase: "closed",
		});
	});

	it("maps the rate limiter's AppError to 429", async () => {
		const { nonce } = await mint();
		rateLimit.mockRejectedValueOnce(
			new AppError({ code: "RATE_LIMIT_EXCEEDED", retryAfter: 5 }),
		);

		const res = await submitHandoffPhoto(nonce, formData, { nowMs: NOW });

		expect(res.status).toBe(429);
		expect(parsePhotoWithQuota).not.toHaveBeenCalled();
	});

	it("ends an expired Handoff before the Use", async () => {
		const { nonce } = await mint();

		const res = await submitHandoffPhoto(nonce, formData, {
			nowMs: EXPIRES_AT,
		});

		expect(res.status).toBe(410);
		expect(res.body).toMatchObject({ reason: "expired" });
		expect(parsePhotoWithQuota).not.toHaveBeenCalled();
	});
});

describe("readHandoffStatus / closeHandoff (desktop)", () => {
	it("reads as lapsed through the grace period, then as expired", async () => {
		const { nonce } = await mint();

		expect(
			await readHandoffStatus(nonce, auth.orgId, { nowMs: EXPIRES_AT - 1 }),
		).toEqual({ phase: "pending" });
		expect(
			await readHandoffStatus(nonce, auth.orgId, { nowMs: EXPIRES_AT }),
		).toEqual({ phase: "lapsed" });
		expect(
			await readHandoffStatus(nonce, auth.orgId, { nowMs: PAST_GRACE }),
		).toEqual({ phase: "expired" });
	});

	it("delivers a result that landed during grace", async () => {
		const { nonce } = await mint();
		await submitHandoffPhoto(nonce, formData, { nowMs: EXPIRES_AT - 1 });

		expect(
			await readHandoffStatus(nonce, auth.orgId, { nowMs: EXPIRES_AT + 1 }),
		).toEqual({ phase: "done", extractedText: data.extractedText });
	});

	it("reads an unknown nonce as expired", async () => {
		expect(await readHandoffStatus("x".repeat(22), auth.orgId)).toEqual({
			phase: "expired",
		});
		expect(await closeHandoff("x".repeat(22), auth.orgId)).toEqual({
			closed: false,
		});
	});

	it("refuses another Organisation's Handoff", async () => {
		const { nonce } = await mint();

		await expect(readHandoffStatus(nonce, "org_2")).rejects.toBeInstanceOf(
			HandoffError,
		);
		await expect(closeHandoff(nonce, "org_2")).rejects.toMatchObject({
			code: "forbidden",
		});
	});

	it("extends a live Link by a full TTL, for the phone and the key alike", async () => {
		const { nonce } = await mint();
		const later = NOW + 60_000;

		expect(await extendHandoff(nonce, auth.orgId, { nowMs: later })).toEqual({
			expiresAt: later + HANDOFF_LINK_TTL_MS,
		});
		expect(
			await inspectHandoff(nonce, { nowMs: EXPIRES_AT + 30_000 }),
		).toMatchObject({ ok: true });
		expect(redis.expiries.get(`handoff:${nonce}`)).toBe(
			Math.ceil((later + HANDOFF_LINK_TTL_MS + HANDOFF_RESULT_GRACE_MS) / 1000),
		);
	});

	it("refuses to extend an expired, settled or unknown Link", async () => {
		const { nonce } = await mint();
		expect(
			await extendHandoff(nonce, auth.orgId, { nowMs: EXPIRES_AT }),
		).toEqual({ expiresAt: null });

		await submitHandoffPhoto(nonce, formData, { nowMs: NOW });
		expect(await extendHandoff(nonce, auth.orgId, { nowMs: NOW })).toEqual({
			expiresAt: null,
		});

		expect(await extendHandoff("x".repeat(22), auth.orgId)).toEqual({
			expiresAt: null,
		});
	});

	it("does not tombstone over a landed result", async () => {
		const { nonce } = await mint();
		await submitHandoffPhoto(nonce, formData, { nowMs: NOW });

		expect(await closeHandoff(nonce, auth.orgId)).toEqual({ closed: false });
		expect(
			await readHandoffStatus(nonce, auth.orgId, { nowMs: NOW }),
		).toMatchObject({ phase: "done" });
	});
});
