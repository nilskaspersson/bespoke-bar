import { describe, expect, test } from "vitest";
import { OCR_QUOTA_WINDOW_MS } from "@/features/billing/constants";
import { deriveOCRQuotaState } from "./getOCRQuotaState";

describe("deriveOCRQuotaState", () => {
	test("remaining > 0 yields no nextAvailableAt", () => {
		const state = deriveOCRQuotaState({
			limit: 3,
			used: 1,
			oldestUseAtMs: Date.parse("2026-05-26T10:00:00.000Z"),
		});

		expect(state).toEqual({
			limit: 3,
			used: 1,
			remaining: 2,
			nextAvailableAt: null,
		});
	});

	test("at the cap, nextAvailableAt is the oldest Use plus the window", () => {
		const oldestMs = Date.parse("2026-05-26T10:00:00.000Z");

		const state = deriveOCRQuotaState({
			limit: 3,
			used: 3,
			oldestUseAtMs: oldestMs,
		});

		expect(state.remaining).toBe(0);
		expect(state.nextAvailableAt).toBe(
			new Date(oldestMs + OCR_QUOTA_WINDOW_MS).toISOString(),
		);
	});

	test("clamps remaining at zero when used exceeds limit", () => {
		const state = deriveOCRQuotaState({
			limit: 3,
			used: 5,
			oldestUseAtMs: Date.parse("2026-05-26T10:00:00.000Z"),
		});

		expect(state.remaining).toBe(0);
		expect(state.nextAvailableAt).not.toBeNull();
	});

	test("no counting uses leaves nextAvailableAt null even at zero remaining", () => {
		const state = deriveOCRQuotaState({
			limit: 0,
			used: 0,
			oldestUseAtMs: null,
		});

		expect(state.remaining).toBe(0);
		expect(state.nextAvailableAt).toBeNull();
	});
});
