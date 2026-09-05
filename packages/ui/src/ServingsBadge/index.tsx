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
	className,
	...props
}: {
	servings: number;
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
			<AnimatedNumber value={servings} format={formatServings} />
			<Icon name="xmark" size={0} />
		</Chip>
	);
}
