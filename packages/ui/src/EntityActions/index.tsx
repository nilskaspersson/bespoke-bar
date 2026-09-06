import type { ReactNode } from "react";
import type { ButtonProps } from "../Button";
import { Flex, type FlexProps } from "../Flex";

export type ActionProps = {
	variant?: ButtonProps["variant"];
	size?: ButtonProps["size"];
	color?: ButtonProps["color"];
	className?: string;
};

export function EntityActions({
	children,
	actionProps,
	...props
}: Omit<FlexProps, "children"> & {
	children: (actionProps: ActionProps) => ReactNode;
	actionProps?: Partial<ActionProps>;
}) {
	return (
		<Flex as="menu" wrap alignItems="center" {...props}>
			{children({
				variant: "action",
				color: "light",
				...actionProps,
			})}
		</Flex>
	);
}
