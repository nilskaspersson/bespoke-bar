import {
	createDateTimeFormatter,
	createRelativeTimeFormatter,
} from "@bespoke/domain/utils/formatting";
import { describe, expect, it } from "vitest";
import { formatLooseRelativeTime } from "./useLooseRelativeTime";

const dateTimeFormatter = createDateTimeFormatter("en-GB");
const relativeTimeFormatter = createRelativeTimeFormatter("en-GB");

describe("formatRelativeTime", () => {
	const mockNow = new Date("2025-06-22T12:00:00Z");

	describe("static labels for recent times", () => {
		it('shows "Just now" for times less than 2 minutes ago', () => {
			const date = new Date("2025-06-22T11:58:30Z"); // 1.5 minutes ago
			expect(
				formatLooseRelativeTime(
					date,
					30,
					mockNow,
					dateTimeFormatter,
					relativeTimeFormatter,
				),
			).toBe("Just now");
		});

		it('shows "A few minutes ago" for times 2-9 minutes ago', () => {
			const date = new Date("2025-06-22T11:57:00Z"); // 3 minutes ago
			expect(
				formatLooseRelativeTime(
					date,
					30,
					mockNow,
					dateTimeFormatter,
					relativeTimeFormatter,
				),
			).toBe("A few minutes ago");
		});
	});

	describe("relative time formatting", () => {
		it("shows minutes for times 10+ minutes ago", () => {
			const date = new Date("2025-06-22T11:45:00Z"); // 15 minutes ago
			expect(
				formatLooseRelativeTime(
					date,
					30,
					mockNow,
					dateTimeFormatter,
					relativeTimeFormatter,
				),
			).toBe("15 minutes ago");
		});

		it("shows hours for times 1+ hours ago", () => {
			const date = new Date("2025-06-22T09:00:00Z"); // 3 hours ago
			expect(
				formatLooseRelativeTime(
					date,
					30,
					mockNow,
					dateTimeFormatter,
					relativeTimeFormatter,
				),
			).toBe("3 hours ago");
		});

		it("shows days for times 1+ days ago", () => {
			const date = new Date("2025-06-20T12:00:00Z"); // 2 days ago
			expect(
				formatLooseRelativeTime(
					date,
					30,
					mockNow,
					dateTimeFormatter,
					relativeTimeFormatter,
				),
			).toBe("2 days ago");
		});

		it("handles future times correctly", () => {
			const date = new Date("2025-06-22T15:00:00Z"); // 3 hours from now
			expect(
				formatLooseRelativeTime(
					date,
					30,
					mockNow,
					dateTimeFormatter,
					relativeTimeFormatter,
				),
			).toBe("in 3 hours");
		});
	});

	describe("absolute time formatting", () => {
		it("shows absolute time for dates beyond default threshold (30 days)", () => {
			const date = new Date("2025-05-20T12:00:00Z"); // 33 days ago
			const result = formatLooseRelativeTime(
				date,
				30,
				mockNow,
				dateTimeFormatter,
				relativeTimeFormatter,
			);
			expect(result).toMatch(/20 May 2025/);
		});

		it("respects custom threshold", () => {
			const date = new Date("2025-06-15T12:00:00Z"); // 7 days ago

			expect(
				formatLooseRelativeTime(
					date,
					30,
					mockNow,
					dateTimeFormatter,
					relativeTimeFormatter,
				),
			).toBe("7 days ago");

			const result = formatLooseRelativeTime(
				date,
				5,
				mockNow,
				dateTimeFormatter,
				relativeTimeFormatter,
			);
			expect(result).toMatch(/15 Jun 2025/);
		});
	});

	describe("edge cases", () => {
		it("handles exactly 1 minute", () => {
			const date = new Date("2025-06-22T11:59:00Z"); // exactly 1 minute ago
			expect(
				formatLooseRelativeTime(
					date,
					30,
					mockNow,
					dateTimeFormatter,
					relativeTimeFormatter,
				),
			).toBe("Just now");
		});

		it("handles exactly 2 minutes", () => {
			const date = new Date("2025-06-22T11:58:00Z"); // exactly 2 minutes ago
			expect(
				formatLooseRelativeTime(
					date,
					30,
					mockNow,
					dateTimeFormatter,
					relativeTimeFormatter,
				),
			).toBe("A few minutes ago");
		});

		it("handles exactly 10 minutes", () => {
			const date = new Date("2025-06-22T11:50:00Z"); // exactly 10 minutes ago
			expect(
				formatLooseRelativeTime(
					date,
					30,
					mockNow,
					dateTimeFormatter,
					relativeTimeFormatter,
				),
			).toBe("10 minutes ago");
		});

		it("handles exactly 1 hour", () => {
			const date = new Date("2025-06-22T11:00:00Z"); // exactly 1 hour ago
			expect(
				formatLooseRelativeTime(
					date,
					30,
					mockNow,
					dateTimeFormatter,
					relativeTimeFormatter,
				),
			).toBe("1 hour ago");
		});

		it("handles exactly threshold days", () => {
			const date = new Date("2025-05-23T12:00:00Z"); // exactly 30 days ago
			const result = formatLooseRelativeTime(
				date,
				30,
				mockNow,
				dateTimeFormatter,
				relativeTimeFormatter,
			);
			expect(result).toMatch(/23 May 2025/);
		});
	});
});
