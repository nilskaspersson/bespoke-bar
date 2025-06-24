import { clsx } from "clsx";
import type { ComponentProps } from "react";
import styles from "./styles.module.css";

export function AppFooter({
	className,
	...props
}: Omit<ComponentProps<"footer">, "children">) {
	return (
		<footer className={clsx(styles.footer, className)} {...props}>
			<div className={styles.contain}></div>
		</footer>
	);
}
