"use client";

import { clsx } from "clsx";
import { useLooseRelativeTime } from "../hooks/useLooseRelativeTime";
import { Text, type TextProps } from "../Text";
import styles from "./styles.module.css";

export function Time({
	className,
	date,
	relativeThreshold = 30,
	...props
}: {
	date: string;
	relativeThreshold?: number;
} & Omit<TextProps, "children">) {
	const formatLooseRelativeTime = useLooseRelativeTime();
	const dateObj = new Date(date);
	const displayText = formatLooseRelativeTime(dateObj, relativeThreshold);
	const isoString = dateObj.toISOString();

	return (
		<Text
			as="time"
			dateTime={isoString}
			title={isoString}
			className={clsx(styles.time, className)}
			compact
			{...props}
		>
			{displayText}
		</Text>
	);
}
