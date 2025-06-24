import { clsx } from "clsx";
import type { ComponentProps } from "react";

import styles from "./styles.module.css";

export function Table({
	className,
	children,
	...props
}: ComponentProps<"table">) {
	return (
		<div className={styles.base}>
			<table className={clsx(styles.table, className)} {...props}>
				{children}
			</table>
		</div>
	);
}
