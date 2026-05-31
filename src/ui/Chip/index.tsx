import { clsx } from "clsx";
import type { ElementType, ReactNode } from "react";
import { Text, type TextProps } from "@/ui/Text";
import type { SystemColor } from "@/utils/types";
import styles from "./styles.module.css";

type ChipVariant = "filled" | "outline";

export type ChipProps<E extends ElementType = "span"> = TextProps<E> & {
	label?: ReactNode;
	icon?: ReactNode;
	color?: SystemColor;
	variant?: ChipVariant;
};

export function Chip<E extends ElementType = "span">({
	as,
	label,
	icon,
	color = "accent",
	variant = "filled",
	children,
	className,
	size = 2,
	compact = true,
	weight = 600,
	...props
}: ChipProps<E>) {
	return (
		<Text
			{...props}
			as={as ?? "span"}
			className={clsx(styles.chip, styles[color], styles[variant], className)}
			compact={compact}
			size={size}
			weight={weight}
		>
			{icon ? <span className={styles.icon}>{icon}</span> : null}
			{label ? <span className={styles.label}>{label}</span> : null}
			{children}
		</Text>
	);
}
