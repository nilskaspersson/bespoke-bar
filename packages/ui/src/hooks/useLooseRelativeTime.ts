"use client";

import { use, useCallback } from "react";
import { FormatterContext } from "../hooks/useFormatter";

export function formatLooseRelativeTime(
	date: Date,
	relativeThreshold = 30,
	now = new Date(),
	dateTimeFormatter: Intl.DateTimeFormat,
	relativeTimeFormatter: Intl.RelativeTimeFormat,
) {
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

export function useLooseRelativeTime() {
	const { dateTimeFormatter, relativeTimeFormatter } = use(FormatterContext);

	return useCallback(
		(date: Date, relativeThreshold = 30, now?: Date) =>
			formatLooseRelativeTime(
				date,
				relativeThreshold,
				now ?? new Date(),
				dateTimeFormatter,
				relativeTimeFormatter,
			),
		[dateTimeFormatter, relativeTimeFormatter],
	);
}
