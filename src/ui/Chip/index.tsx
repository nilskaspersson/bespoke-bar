import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import styles from "./styles.module.css";

export function Chip({
	label,
	children,
	className,
	...props
}: ComponentProps<"div"> & { label?: ReactNode }) {
	return (
		<div className={clsx(styles.chip, className)} {...props}>
			{label ? <span className={styles.label}>{label}</span> : null}
			{children}
		</div>
	);
}
