import { clsx } from "clsx";
import type { ComponentProps } from "react";
import styles from "./styles.module.css";

type Props = {
	rounded?: boolean;
	forceTheme?: "light" | "dark";
};

export function Lightbox({
	children,
	className,
	rounded,
	forceTheme,
	...props
}: ComponentProps<"div"> & Props) {
	return (
		<div
			data-theme={forceTheme}
			className={clsx(styles.lightbox, className, {
				[styles.rounded]: rounded,
			})}
			{...props}
		>
			{children}
		</div>
	);
}
