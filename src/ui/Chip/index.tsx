import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Text } from "@/ui/Text";
import type { SystemColor } from "@/utils/types";
import styles from "./styles.module.css";

export function Chip({
	label,
	color = "accent",
	children,
	className,
	size = 2,
	style,
	...props
}: Omit<ComponentProps<typeof Text>, "color"> & {
	label?: ReactNode;
	color?: SystemColor;
}) {
	return (
		<Text
			as="span"
			className={clsx(styles.chip, styles[color], className)}
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
