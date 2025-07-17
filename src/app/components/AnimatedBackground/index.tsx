import { clsx } from "clsx";
import type { ComponentProps } from "react";
import styles from "./styles.module.css";

export function AnimatedBackground({
	className,
	...props
}: Omit<ComponentProps<"div">, "children">) {
	return (
		<div
			className={clsx(styles.background, className)}
			aria-hidden="true"
			{...props}
		>
			<div className={clsx(styles.bgA, styles.bg)} />
			<div className={clsx(styles.bgB, styles.bg)} />
			<div className={clsx(styles.bgC, styles.bg)} />
		</div>
	);
}
