import { clsx } from "clsx";
import type { HTMLAttributes } from "react";
import styles from "./styles.module.css";

export function GradientText({
	children,
	className,
	...props
}: HTMLAttributes<HTMLSpanElement>) {
	return (
		<span {...props} className={clsx(className, styles.gradient)}>
			{children}
		</span>
	);
}
