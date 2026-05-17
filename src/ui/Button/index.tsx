import { clsx } from "clsx";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { SystemColor } from "@/utils/types";
import styles from "./styles.module.css";

type Props = {
	icon?: boolean;
	className?: string;
	variant?:
		| "solid"
		| "outline"
		| "base"
		| "ghost"
		| "text"
		| "action"
		| "clear";
	color?: SystemColor;
	size?: "tiny" | "small" | "default" | "large";
	fullWidth?: boolean;
	rounded?: boolean;
	endAdornment?: ReactNode;
};

export function Button({
	children,
	className,
	variant,
	color,
	size,
	icon,
	fullWidth,
	rounded,
	endAdornment,
	...props
}: Props & Omit<ComponentProps<"button">, "color">) {
	return (
		<button
			type="button"
			{...props}
			className={generateButtonClassName({
				className,
				variant,
				color,
				size,
				icon,
				fullWidth,
				rounded,
				endAdornment,
			})}
		>
			<span className={styles.label}>{children}</span>

			{endAdornment}
		</button>
	);
}

export type ButtonProps = ComponentProps<typeof Button>;

export function LinkButton({
	children,
	className,
	color,
	icon,
	variant,
	size,
	fullWidth,
	rounded,
	endAdornment,
	...props
}: Props & { href: Route } & ComponentProps<typeof Link>) {
	return (
		<Link
			{...props}
			className={generateButtonClassName({
				className,
				variant,
				color,
				size,
				icon,
				fullWidth,
				rounded,
				endAdornment,
			})}
		>
			<span className={styles.label}>{children}</span>
			{endAdornment}
		</Link>
	);
}

export function generateButtonClassName({
	className,
	variant = "base",
	color = "light",
	size = "default",
	icon,
	fullWidth,
	rounded,
	endAdornment,
}: Props) {
	return clsx(
		className,
		styles.reset,
		styles.button,
		styles.link,
		styles[variant],
		styles[color],
		styles[size],
		{
			[styles.icon]: icon,
			[styles.fullWidth]: fullWidth,
			[styles.rounded]: rounded,
			[styles.hasEndAdornment]: Boolean(endAdornment),
		},
	);
}
