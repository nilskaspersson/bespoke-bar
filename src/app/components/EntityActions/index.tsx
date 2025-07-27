import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import type { ButtonProps } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
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
	actionProps,
	...props
}: Omit<ComponentProps<typeof Flex>, "children"> & {
	children: (actionProps: ActionProps) => ReactNode;
	actionProps?: Partial<ActionProps>;
}) {
	return (
		<Flex
			as="menu"
			className={clsx(styles.actions, className, {
				[styles.withOffset]:
					!actionProps?.variant || actionProps.variant === "ghost",
			})}
			wrap
			alignItems="center"
			gap={0}
			{...props}
		>
			{children({
				variant: "ghost",
				size: "tiny",
				color: "light",
				className: styles.action,
				...actionProps,
			})}
		</Flex>
	);
}
