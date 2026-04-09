"use client";

import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { useLooseRelativeTime } from "@/hooks/useLooseRelativeTime";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function Time({
	className,
	date,
	relativeThreshold = 30,
	...props
}: {
	date: string;
	relativeThreshold?: number;
} & Omit<ComponentProps<typeof Text>, "children">) {
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
