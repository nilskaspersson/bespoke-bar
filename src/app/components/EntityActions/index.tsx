import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import type { ButtonProps } from "@/ui/Button";
import styles from "./styles.module.css";

export type ActionProps = {
	variant?: ButtonProps["variant"];
	size?: ButtonProps["size"];
	color?: ButtonProps["color"];
	className?: string;
};

export function EntityActions({
	children,
	className,
	...props
}: Omit<ComponentProps<"menu">, "children"> & {
	children: (actionProps: ActionProps) => ReactNode;
}) {
	return (
		<menu className={clsx(styles.actions, className)} {...props}>
			{children({
				variant: "ghost",
				size: "tiny",
				color: "light",
				className: styles.action,
			})}
		</menu>
	);
}
