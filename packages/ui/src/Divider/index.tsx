import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Text } from "../Text";
import styles from "./styles.module.css";

export function Divider({
	children,
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={clsx(className, styles.divider, {
				[styles.labeled]: children != null,
			})}
		>
			{children != null ? (
				<Text as="span" size={2} className={styles.label}>
					{children}
				</Text>
			) : null}
		</div>
	);
}
