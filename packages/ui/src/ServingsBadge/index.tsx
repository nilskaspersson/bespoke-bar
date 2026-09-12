"use client";

import { clsx } from "clsx";
import { use, useCallback } from "react";
import { AnimatedNumber } from "../AnimatedNumber";
import { Chip, type ChipProps } from "../Chip";
import { FormatterContext } from "../hooks/useFormatter";
import { Icon } from "../Icon";
import styles from "./styles.module.css";

export function ServingsBadge({
	servings,
	animateNumbers = true,
	className,
	...props
}: {
	servings: number;
	animateNumbers?: boolean;
} & Omit<ChipProps, "children">) {
	const { quantityFormatter } = use(FormatterContext);

	const formatServings = useCallback(
		(v: number) => quantityFormatter.format(v),
		[quantityFormatter],
	);

	return (
		<Chip
			color="accent"
			size={1}
			className={clsx(styles.servingsBadge, className)}
			{...props}
		>
			{animateNumbers ? (
				<AnimatedNumber value={servings} format={formatServings} />
			) : (
				formatServings(servings)
			)}
			<Icon name="xmark" size={0} />
		</Chip>
	);
}
