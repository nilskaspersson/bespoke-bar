import { clsx } from "clsx";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { SystemColor } from "@/utils/types";
import styles from "./styles.module.css";

type Props = {
	icon?: boolean;
	variant?: "solid" | "outline" | "base" | "ghost" | "text";
	color?: SystemColor;
	size?: "tiny" | "small" | "default" | "large";
	fullWidth?: boolean;
	rounded?: boolean;
};

export function Button({
	children,
	className,
	color = "regular",
	icon,
	variant = "base",
	size = "default",
	fullWidth,
	rounded,
	...props
}: Props & Omit<ComponentProps<"button">, "color">) {
	return (
		<button
			type="button"
			{...props}
			className={clsx(
				className,
				styles.reset,
				styles.button,
				styles[variant],
				styles[color],
				styles[size],
				{
					[styles.icon]: icon,
					[styles.fullWidth]: fullWidth,
					[styles.rounded]: rounded,
				},
			)}
		>
			<span className={styles.label}>{children}</span>
		</button>
	);
}

export type ButtonProps = ComponentProps<typeof Button>;

export function LinkButton({
	children,
	className,
	color = "light",
	icon,
	variant = "base",
	size = "default",
	...props
}: Props & { href: Route } & ComponentProps<typeof Link>) {
	return (
		<Link
			{...props}
			className={clsx(
				className,
				styles.reset,
				styles.button,
				styles.link,
				styles[variant],
				styles[color],
				styles[size],
				{
					[styles.icon]: icon,
				},
			)}
		>
			<span className={styles.label}>{children}</span>
		</Link>
	);
}
