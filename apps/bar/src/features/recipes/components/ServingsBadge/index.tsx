"use client";

import { AnimatedNumber } from "@bespoke/ui/AnimatedNumber";
import { Chip, type ChipProps } from "@bespoke/ui/Chip";
import { FormatterContext } from "@bespoke/ui/hooks/useFormatter";
import { Icon } from "@bespoke/ui/Icon";
import { clsx } from "clsx";
import { use, useCallback } from "react";
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
