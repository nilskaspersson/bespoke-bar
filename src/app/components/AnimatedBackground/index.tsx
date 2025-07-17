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
			<div className={clsx(styles.bg, styles.back)} />
			<div className={clsx(styles.bg, styles.middle)} />
			<div className={clsx(styles.bg, styles.front)} />
		</div>
	);
}
