import { clsx } from "clsx";
import type { Route } from "next";
import Link from "next/link";
import type {
	AnchorHTMLAttributes,
	ButtonHTMLAttributes,
	ComponentProps,
	RefAttributes,
} from "react";

import styles from "./styles.module.css";

type Props = {
	icon?: boolean;
	variant?: "solid" | "outline" | "base";
};

export function Button({
	icon,
	variant = "base",
	children,
	...props
}: Props &
	RefAttributes<HTMLButtonElement> &
	ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			type="button"
			{...props}
			className={clsx(styles.button, props.className, styles[variant], {
				[styles.icon]: icon,
			})}
		>
			{children}
		</button>
	);
}

export type ButtonProps = ComponentProps<typeof Button>;

export function LinkButton({
	icon,
	variant = "outline",
	children,
	...props
}: Props & { href: Route } & RefAttributes<HTMLAnchorElement> &
	AnchorHTMLAttributes<HTMLAnchorElement>) {
	return (
		<Link
			{...props}
			className={clsx(styles.button, props.className, styles[variant], {
				[styles.icon]: icon,
			})}
		>
			{children}
		</Link>
	);
}
