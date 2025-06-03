import { Slot, type SlotProps } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import { createElement } from "react";
import { mergeStyleSources, toCSSVars } from "@/utils/styles";
import type { Scale } from "@/utils/types";
import styles from "./styles.module.css";

type Props = {
	alignItems?: "flex-start" | "flex-end" | "center" | "stretch";
	as?: React.ElementType;
	asChild?: boolean;
	wrap?: boolean;
	direction?: "row" | "column";
	gap?: Scale;
	justifyContent?:
		| "flex-start"
		| "flex-end"
		| "center"
		| "stretch"
		| "space-between";
};

export function Flex({
	alignItems = "flex-start",
	as = "div",
	asChild,
	children,
	direction = "row",
	gap,
	justifyContent,
	wrap,
	...slotProps
}: Props & SlotProps) {
	return createElement(
		asChild ? Slot : as,
		{
			...slotProps,
			className: clsx(slotProps.className, styles.flex, {
				[styles.wrap]: wrap,
				[styles.column]: direction === "column",
			}),
			style: mergeStyleSources(
				slotProps.style,
				toCSSVars({
					jsxAlignItems: alignItems,
					jsxJustifyContent: justifyContent,
					jsxGap: gap ? `var(--space-${gap})` : 0,
				}),
			),
		},
		children,
	);
}
