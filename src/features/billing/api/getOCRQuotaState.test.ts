import { describe, expect, test } from "vitest";
import { OCR_QUOTA_WINDOW_MS } from "@/features/billing/constants";
import { deriveOCRQuotaState } from "./getOCRQuotaState";

describe("deriveOCRQuotaState", () => {
	test("remaining > 0 yields no nextAvailableAt", () => {
		const state = deriveOCRQuotaState({
			limit: 3,
			used: 1,
			oldestCountingUseAt: "2026-05-26T10:00:00.000Z",
		});

		expect(state).toEqual({
			limit: 3,
			used: 1,
			remaining: 2,
			nextAvailableAt: null,
		});
	});

	test("at the cap, nextAvailableAt is the oldest Use + 24h", () => {
		const oldest = "2026-05-26T10:00:00.000Z";

		const state = deriveOCRQuotaState({
			limit: 3,
			used: 3,
			oldestCountingUseAt: oldest,
		});

		expect(state.remaining).toBe(0);
		expect(state.nextAvailableAt).toBe(
			new Date(Date.parse(oldest) + OCR_QUOTA_WINDOW_MS).toISOString(),
		);
	});

	test("clamps remaining at zero when used exceeds limit", () => {
		const state = deriveOCRQuotaState({
			limit: 3,
			used: 5,
			oldestCountingUseAt: "2026-05-26T10:00:00.000Z",
		});

		expect(state.remaining).toBe(0);
		expect(state.nextAvailableAt).not.toBeNull();
	});

	test("no counting uses leaves nextAvailableAt null even at zero remaining", () => {
		const state = deriveOCRQuotaState({
			limit: 0,
			used: 0,
			oldestCountingUseAt: null,
		});

		expect(state.remaining).toBe(0);
		expect(state.nextAvailableAt).toBeNull();
	});
});
