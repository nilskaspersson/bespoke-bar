import type { ButtonProps } from "@bespoke/ui/Button";
import { Flex, type FlexProps } from "@bespoke/ui/Flex";
import type { ReactNode } from "react";

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
