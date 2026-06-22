"use client";

import { clsx } from "clsx";
import {
	AnimatePresence,
	m,
	type Transition,
	useReducedMotion,
	type Variants,
} from "motion/react";
import { type ComponentPropsWithoutRef, useState } from "react";
import styles from "./styles.module.css";

type Props = {
	value: number;
	format?: (value: number) => string;
	className?: string;
};

const DEFAULT_FORMAT = (value: number) => value.toString();

const ROLL_TRANSITION: Transition = {
	type: "spring",
	visualDuration: 0.25,
	bounce: 0.35,
};

export function AnimatedNumber({
	value,
	format = DEFAULT_FORMAT,
	className,
	...props
}: Props & ComponentPropsWithoutRef<"span">) {
	const prefersReducedMotion = useReducedMotion();
	const [[previous, direction], setSwap] = useState<[number, number]>([
		value,
		0,
	]);

	if (previous !== value) {
		setSwap([value, Math.sign(value - previous)]);
	}

	const slide = prefersReducedMotion ? 0 : direction;
	const formatted = format(value);

	return (
		<span {...props} className={clsx(className, styles.number)}>
			<span aria-hidden className={styles.sizer}>
				{formatted}
			</span>

			<AnimatePresence initial={false} custom={slide}>
				<m.span
					key={formatted}
					custom={slide}
					className={styles.value}
					variants={rollVariants}
					initial="enter"
					animate="settled"
					exit="exit"
					transition={ROLL_TRANSITION}
				>
					{formatted}
				</m.span>
			</AnimatePresence>
		</span>
	);
}

const rollVariants: Variants = {
	enter: (slide: number) => ({
		y: `${slide * 100}%`,
		opacity: slide === 0 ? 0 : 1,
	}),
	settled: { y: "0%", opacity: 1 },
	exit: (slide: number) => ({
		y: `${slide * -100}%`,
		opacity: slide === 0 ? 0 : 1,
	}),
};
