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
	date: Date;
	relativeThreshold?: number;
} & Omit<ComponentProps<typeof Text>, "children">) {
	const formatLooseRelativeTime = useLooseRelativeTime();
	const displayText = formatLooseRelativeTime(date, relativeThreshold);
	const isoString = date.toISOString();

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
