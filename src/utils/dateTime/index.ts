import { dateTimeFormatter, relativeTimeFormatter } from "@/utils/formatting";

export function formatRelativeTime(
	date: Date,
	relativeThreshold = 30,
	now = new Date(),
): string {
	const diffInMs = date.getTime() - now.getTime();
	const absDiffInDays = Math.floor(Math.abs(diffInMs) / (1000 * 60 * 60 * 24));

	/**
	 * Absolute time if beyond threshold
	 */
	if (absDiffInDays >= relativeThreshold) {
		return dateTimeFormatter.format(date);
	}

	const diffInMinutes = Math.floor(Math.abs(diffInMs) / (1000 * 60));
	const diffInHours = Math.floor(Math.abs(diffInMs) / (1000 * 60 * 60));
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

	if (diffInMinutes < 2) {
		return "Just now";
	} else if (diffInMinutes < 10) {
		return "A few minutes ago";
	} else if (absDiffInDays >= 1) {
		return relativeTimeFormatter.format(diffInDays, "day");
	} else if (diffInHours >= 1) {
		return relativeTimeFormatter.format(
			Math.floor(diffInMs / (1000 * 60 * 60)),
			"hour",
		);
	} else {
		return relativeTimeFormatter.format(
			Math.floor(diffInMs / (1000 * 60)),
			"minute",
		);
	}
}
