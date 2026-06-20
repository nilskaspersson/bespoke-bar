import { describe, expect, test } from "vitest";
import { deriveOCRQuotaState } from "./getOCRQuotaState";

const NOW = Date.parse("2026-06-10T12:00:00.000Z");
const MAY_START = Date.parse("2026-05-01T00:00:00.000Z");
const JUNE_START = Date.parse("2026-06-01T00:00:00.000Z");

describe("deriveOCRQuotaState", () => {
	test("remaining > 0 yields no nextAvailableAt", () => {
		const state = deriveOCRQuotaState({
			limit: 3,
			used: 1,
			monthStartMs: JUNE_START,
			nowMs: NOW,
		});

		expect(state).toEqual({
			limit: 3,
			used: 1,
			remaining: 2,
			nextAvailableAt: null,
		});
	});

	test("at the cap, nextAvailableAt is the start of next month", () => {
		const state = deriveOCRQuotaState({
			limit: 3,
			used: 3,
			monthStartMs: JUNE_START,
			nowMs: NOW,
		});

		expect(state.remaining).toBe(0);
		expect(state.nextAvailableAt).toBe("2026-07-01T00:00:00.000Z");
	});

	test("clamps remaining at zero when used exceeds limit", () => {
		const state = deriveOCRQuotaState({
			limit: 3,
			used: 5,
			monthStartMs: JUNE_START,
			nowMs: NOW,
		});

		expect(state.remaining).toBe(0);
		expect(state.nextAvailableAt).not.toBeNull();
	});

	test("a cached count from a previous month reads as zero used", () => {
		const state = deriveOCRQuotaState({
			limit: 3,
			used: 3,
			monthStartMs: MAY_START,
			nowMs: NOW,
		});

		expect(state).toEqual({
			limit: 3,
			used: 0,
			remaining: 3,
			nextAvailableAt: null,
		});
	});

	test("a zero limit never promises a reset", () => {
		const state = deriveOCRQuotaState({
			limit: 0,
			used: 0,
			monthStartMs: JUNE_START,
			nowMs: NOW,
		});

		expect(state.remaining).toBe(0);
		expect(state.nextAvailableAt).toBeNull();
	});

	test("year rollover: a December cap unlocks January 1st", () => {
		const state = deriveOCRQuotaState({
			limit: 3,
			used: 3,
			monthStartMs: Date.parse("2026-12-01T00:00:00.000Z"),
			nowMs: Date.parse("2026-12-31T23:59:00.000Z"),
		});

		expect(state.nextAvailableAt).toBe("2027-01-01T00:00:00.000Z");
	});
});
