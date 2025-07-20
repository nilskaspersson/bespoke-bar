import { clsx } from "clsx";
import type { ComponentProps } from "react";
import styles from "./styles.module.css";

export function Noise({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			className={clsx(styles.texture, className)}
			role="presentation"
			{...props}
		/>
	);
}
