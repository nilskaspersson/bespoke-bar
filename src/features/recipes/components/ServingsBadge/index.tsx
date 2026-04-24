"use client";

import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { use, useCallback } from "react";
import { FormatterContext } from "@/hooks/useFormatter";
import { AnimatedNumber } from "@/ui/AnimatedNumber";
import { Chip } from "@/ui/Chip";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

export function ServingsBadge({
	servings,
	className,
	...props
}: {
	servings: number;
} & Omit<ComponentProps<typeof Chip>, "children">) {
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
