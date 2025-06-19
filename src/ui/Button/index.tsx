import { clsx } from "clsx";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { SystemColor } from "@/utils/types";
import styles from "./styles.module.css";

type Props = {
	icon?: boolean;
	variant?: "solid" | "outline" | "base" | "ghost";
	color?: SystemColor;
	size?: "tiny" | "small" | "regular" | "large";
	fullWidth?: boolean;
};

export function Button({
	children,
	className,
	color = "light",
	icon,
	variant = "base",
	size = "regular",
	fullWidth,
	...props
}: Props & Omit<ComponentProps<"button">, "color">) {
	return (
		<button
			type="button"
			{...props}
			className={clsx(
				className,
				styles.button,
				styles[variant],
				styles[color],
				styles[size],
				{
					[styles.icon]: icon,
					[styles.fullWidth]: fullWidth,
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
	size = "regular",
	...props
}: Props & { href: Route } & ComponentProps<typeof Link>) {
	return (
		<Link
			{...props}
			className={clsx(
				className,
				styles.button,
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
