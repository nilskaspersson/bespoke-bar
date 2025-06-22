"use client";

import { clsx } from "clsx";
import { type ComponentProps, useEffect, useState } from "react";
import { Text } from "@/ui/Text";
import { formatRelativeTime } from "@/utils/dateTime";
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
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	/**
	 * Avoid hydration mismatch by not rendering on server. An alternative to this
	 * could be to always render absolute time on the server, but that would cause
	 * visual noise.
	 */
	if (!mounted) {
		return null;
	}

	const displayText = formatRelativeTime(date, relativeThreshold);
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
