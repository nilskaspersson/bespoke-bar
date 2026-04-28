import type { ComponentProps, ReactNode } from "react";
import type { ButtonProps } from "@/ui/Button";
import { Flex } from "@/ui/Flex";

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
}: Omit<ComponentProps<typeof Flex>, "children"> & {
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
