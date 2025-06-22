import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Noise } from "@/ui/Noise";
import styles from "./styles.module.css";

export function Lightbox({
	children,
	className,
	rounded,
	...props
}: ComponentProps<"div"> & { rounded?: boolean }) {
	return (
		<div
			className={clsx(styles.lightbox, className, {
				[styles.rounded]: rounded,
			})}
			{...props}
		>
			<Noise />
			{children}
		</div>
	);
}
