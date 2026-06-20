import { clsx } from "clsx";
import type { ComponentProps } from "react";
import styles from "./styles.module.css";

type Props = {
	rounded?: boolean;
	theme?: "light" | "dark";
};

export function Lightbox({
	children,
	className,
	rounded,
	theme,
	...props
}: ComponentProps<"div"> & Props) {
	return (
		<div
			data-theme={theme}
			className={clsx(styles.lightbox, className, {
				[styles.rounded]: rounded,
			})}
			{...props}
		>
			{children}
		</div>
	);
}
