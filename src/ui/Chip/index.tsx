import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Text } from "@/ui/Text";
import type { SystemColor } from "@/utils/types";
import styles from "./styles.module.css";

type ChipVariant = "filled" | "outline";

export function Chip({
	label,
	color = "accent",
	variant = "filled",
	children,
	className,
	size = 2,
	...props
}: Omit<ComponentProps<typeof Text>, "color"> & {
	label?: ReactNode;
	color?: SystemColor;
	variant?: ChipVariant;
}) {
	return (
		<Text
			as="span"
			className={clsx(styles.chip, styles[color], styles[variant], className)}
			compact
			size={size}
			weight={600}
			{...props}
		>
			{label ? <span className={styles.label}>{label}</span> : null}
			{children}
		</Text>
	);
}
