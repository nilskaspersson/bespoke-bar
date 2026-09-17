import { describe, expect, it } from "vitest";
import { ocrQuotaReachedPayload } from "./ocrQuotaReached";

const NOW = 1_700_000_000_000;

describe("ocrQuotaReachedPayload", () => {
	it("rounds the wait up to whole seconds, never below one", () => {
		expect(
			ocrQuotaReachedPayload(
				{
					limit: 3,
					used: 3,
					nextAvailableAt: new Date(NOW + 90_500).toISOString(),
				},
				NOW,
			),
		).toEqual({ code: "OCR_QUOTA_REACHED", limit: 3, used: 3, retryAfter: 91 });

		expect(
			ocrQuotaReachedPayload(
				{
					limit: 3,
					used: 3,
					nextAvailableAt: new Date(NOW - 1000).toISOString(),
				},
				NOW,
			).retryAfter,
		).toBe(1);
	});

	it("falls back to one second without a reset moment", () => {
		expect(
			ocrQuotaReachedPayload({ limit: 3, used: 3, nextAvailableAt: null }, NOW)
				.retryAfter,
		).toBe(1);
	});
});
