import { clsx } from "clsx";
import type { ComponentProps } from "react";
import styles from "./styles.module.css";

type Props = {
	rounded?: boolean;
	forceTheme?: "light" | "dark";
	translucent?: boolean;
};

export function Lightbox({
	children,
	className,
	rounded,
	forceTheme,
	translucent,
	...props
}: ComponentProps<"div"> & Props) {
	return (
		<div
			data-theme={forceTheme}
			className={clsx(styles.lightbox, className, {
				[styles.rounded]: rounded,
				[styles.translucent]: translucent,
			})}
			{...props}
		>
			{children}
		</div>
	);
}
