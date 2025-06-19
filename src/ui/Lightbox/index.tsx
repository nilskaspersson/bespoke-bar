import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Noise } from "@/ui/Noise";
import styles from "./styles.module.css";

export function Lightbox({
	children,
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div className={clsx(styles.lightbox, className)} {...props}>
			<Noise />
			{children}
		</div>
	);
}
