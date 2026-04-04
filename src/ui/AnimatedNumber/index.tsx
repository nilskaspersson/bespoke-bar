"use client";

import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, useLayoutEffect, useRef } from "react";
import { tween } from "@/utils/animate";
import styles from "./styles.module.css";

type Props = {
	value: number;
	format?: (value: number, precision?: number) => string;
	duration?: number;
	className?: string;
};

const DEFAULT_FORMAT = (v: number) => v.toString();
const DEFAULT_DURATION = 400;

/**
 * Renders a number that animates smoothly between values.
 * Preserves the target's decimal precision throughout the transition,
 * and passes it to `format` for consistent display (e.g., locale formatting).
 */
export function AnimatedNumber({
	value,
	format = DEFAULT_FORMAT,
	duration = DEFAULT_DURATION,
	className,
	...props
}: Props & ComponentPropsWithoutRef<"span">) {
	const ref = useRef<HTMLSpanElement>(null);
	const displayRef = useRef(value);

	useLayoutEffect(() => {
		const from = displayRef.current;

		if (ref.current) {
			ref.current.textContent = format(from);
		}

		if (from === value) return;

		return tween(from, value, duration, (current, precision) => {
			displayRef.current = current;

			if (ref.current) {
				ref.current.textContent = format(current, precision);
			}
		});
	}, [value, format, duration]);

	return (
		<span {...props} ref={ref} className={clsx(className, styles.number)}>
			{format(value)}
		</span>
	);
}
