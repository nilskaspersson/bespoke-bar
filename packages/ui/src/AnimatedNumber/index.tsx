"use client";

import { mergeStyleSources, toCSSVars } from "@bespoke/ui/utils/styles";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, useState } from "react";
import styles from "./styles.module.css";

type Props = {
	value: number;
	format?: (value: number) => string;
	className?: string;
};

const DEFAULT_FORMAT = (value: number) => value.toString();

type Roll = {
	value: number;
	direction: number;
	exiting: string | null;
	generation: number;
};

export function AnimatedNumber({
	value,
	format = DEFAULT_FORMAT,
	className,
	...props
}: Props & ComponentPropsWithoutRef<"span">) {
	const [roll, setRoll] = useState<Roll>({
		value,
		direction: 0,
		exiting: null,
		generation: 0,
	});

	if (roll.value !== value) {
		setRoll({
			value,
			direction: Math.sign(value - roll.value),
			exiting: format(roll.value),
			generation: roll.generation + 1,
		});
	}

	const formatted = format(value);
	const rolled = roll.generation > 0;

	return (
		<span
			{...props}
			className={clsx(className, styles.number)}
			style={mergeStyleSources(
				props.style,
				toCSSVars({ slide: roll.direction }),
			)}
		>
			<span aria-hidden className={styles.sizer}>
				{formatted}
			</span>

			<span
				key={roll.generation}
				className={clsx(styles.value, { [styles.enter]: rolled })}
			>
				{formatted}
			</span>

			{roll.exiting !== null ? (
				<span
					key={`exit-${roll.generation}`}
					aria-hidden
					className={clsx(styles.value, styles.exit)}
					onAnimationEnd={() => setRoll((r) => ({ ...r, exiting: null }))}
				>
					{roll.exiting}
				</span>
			) : null}
		</span>
	);
}
