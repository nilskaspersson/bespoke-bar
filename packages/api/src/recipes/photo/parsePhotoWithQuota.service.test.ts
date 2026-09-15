import { AppError } from "@bespoke/schema/appError";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@bespoke/db", () => ({ db: {} }));

const after = vi.fn();
vi.mock("next/server", () => ({ after }));

const getCachedOCRQuotaState = vi.fn();
vi.mock("../../billing/getOCRQuotaState", () => ({ getCachedOCRQuotaState }));

const recordOCRUse = vi.fn();
const refundOCRUse = vi.fn();
vi.mock("../../billing/recordOCRUse.service", () => ({
	recordOCRUse,
	refundOCRUse,
}));

const emit = vi.fn();
vi.mock("../../cache", () => ({
	cacheEvents: { ocrQuotaUse: { changed: { emit } } },
}));

const parseTextFromImageService = vi.fn();
vi.mock("./parseTextFromImage.service", () => ({ parseTextFromImageService }));

const { parsePhotoWithQuota } = await import("./parsePhotoWithQuota.service");

const auth = { orgId: "org1", userId: "user1" };
const formData = new FormData();

function stateWithRemaining(remaining: number) {
	return {
		limit: 3,
		used: 3 - remaining,
		remaining,
		nextAvailableAt: new Date(Date.now() + 90_000).toISOString(),
	};
}

beforeEach(() => {
	vi.clearAllMocks();
	getCachedOCRQuotaState.mockResolvedValue(stateWithRemaining(2));
	recordOCRUse.mockResolvedValue({ useId: "use1" });
	refundOCRUse.mockResolvedValue(undefined);
});

describe("parsePhotoWithQuota", () => {
	it("early-rejects off the cached state without touching the Use log", async () => {
		getCachedOCRQuotaState.mockResolvedValue(stateWithRemaining(0));

		const result = await parsePhotoWithQuota(auth, formData);

		expect(result.status).toBe(429);
		expect(result.body).toMatchObject({
			ok: false,
			error: { code: "OCR_QUOTA_REACHED", limit: 3, used: 3 },
		});
		if (result.body.ok || !("code" in result.body.error)) {
			throw new Error("expected an OCR_QUOTA_REACHED payload");
		}
		expect(result.body.error).toMatchObject({ retryAfter: expect.any(Number) });
		expect(recordOCRUse).not.toHaveBeenCalled();
		expect(parseTextFromImageService).not.toHaveBeenCalled();
	});

	it("passes the authoritative gate's payload through as 429", async () => {
		const payload = {
			code: "OCR_QUOTA_REACHED" as const,
			limit: 3,
			used: 3,
			retryAfter: 60,
		};
		recordOCRUse.mockRejectedValue(new AppError(payload));

		const result = await parsePhotoWithQuota(auth, formData);

		expect(result).toEqual({
			status: 429,
			body: { ok: false, error: payload },
		});
		expect(parseTextFromImageService).not.toHaveBeenCalled();
	});

	it("rethrows unexpected failures from the gate", async () => {
		recordOCRUse.mockRejectedValue(new Error("db down"));

		await expect(parsePhotoWithQuota(auth, formData)).rejects.toThrow(
			"db down",
		);
	});

	it("returns the parsed text and settles the Use on success", async () => {
		const data = { rawOcrText: "raw", extractedText: "Negroni\n30 ml gin" };
		parseTextFromImageService.mockResolvedValue(data);

		const result = await parsePhotoWithQuota(auth, formData);

		expect(result).toEqual({ status: 200, body: { ok: true, data } });
		expect(recordOCRUse).toHaveBeenCalledWith(auth);
		expect(emit).toHaveBeenCalledWith("org1");
		expect(after).toHaveBeenCalledTimes(1);
		expect(refundOCRUse).not.toHaveBeenCalled();
	});

	it("keeps the Use when Vision answered but no recipe was found", async () => {
		const payload = { code: "NO_RECIPE_FOUND" as const };
		parseTextFromImageService.mockRejectedValue(new AppError(payload));

		const result = await parsePhotoWithQuota(auth, formData);

		expect(result).toEqual({
			status: 422,
			body: { ok: false, error: payload },
		});
		expect(emit).toHaveBeenCalledWith("org1");
		expect(after).toHaveBeenCalledTimes(1);
		expect(refundOCRUse).not.toHaveBeenCalled();
	});

	it("refunds the Use when the pipeline fails before a Vision 2xx", async () => {
		parseTextFromImageService.mockRejectedValue(new Error("Vision timeout"));

		const result = await parsePhotoWithQuota(auth, formData);

		expect(result).toEqual({
			status: 400,
			body: { ok: false, error: { message: "Vision timeout" } },
		});
		expect(refundOCRUse).toHaveBeenCalledWith("use1", "org1");
		expect(emit).toHaveBeenCalledWith("org1");
		expect(after).not.toHaveBeenCalled();
	});

	it("falls back to a generic message for non-Error throws", async () => {
		parseTextFromImageService.mockRejectedValue("boom");

		const result = await parsePhotoWithQuota(auth, formData);

		expect(result.body).toEqual({
			ok: false,
			error: { message: "Failed to parse image" },
		});
		expect(refundOCRUse).toHaveBeenCalledWith("use1", "org1");
	});
});
