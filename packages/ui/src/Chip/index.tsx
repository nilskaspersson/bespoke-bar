import { clsx } from "clsx";
import type { ElementType, ReactNode } from "react";
import { Flex } from "../Flex";
import { Text, type TextProps } from "../Text";
import type { SystemColor } from "../utils/types";
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
			{label ? <span className={styles.label}>{label}</span> : null}

			<Flex gap={1}>
				{icon ? <span className={styles.icon}>{icon}</span> : null}
				{children}
			</Flex>
		</Text>
	);
}
