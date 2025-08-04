import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { toCSSVars } from "@/utils/styles";
import styles from "./styles.module.css";

export function Skeleton({
	children,
	height,
	width,
	variant = "block",
	...props
}: ComponentProps<"span"> & {
	width?: string;
	height?: string;
	variant?: "block" | "input" | "text";
}) {
	return (
		<span
			{...props}
			role="presentation"
			className={clsx(props.className, styles.skeleton, styles[variant])}
			style={toCSSVars({
				jsxWidth: width,
				jsxHeight: height,
			})}
		>
			{children}
		</span>
	);
}

export function SkeletonScreen({
	children,
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div {...props} className={clsx(className, styles.fade)}>
			{children}
		</div>
	);
}
