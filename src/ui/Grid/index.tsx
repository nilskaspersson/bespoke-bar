import { Slot, type SlotProps } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import { createElement } from "react";
import { mergeStyleSources, toCSSVars } from "@/utils/styles";
import type { Scale } from "@/utils/types";
import styles from "./styles.module.css";

type Props = {
	alignContent?: "start" | "end" | "center" | "stretch" | "space-between";
	alignItems?: "start" | "end" | "center" | "stretch";
	as?: React.ElementType;
	asChild?: boolean;
	gap?: Scale;
	justifyContent?: "start" | "end" | "center" | "stretch" | "space-between";
	justifyItems?: "start" | "end" | "center" | "stretch" | "baseline";
};

export function Grid({
	alignContent,
	alignItems,
	as = "div",
	asChild,
	children,
	gap = 0,
	justifyContent,
	justifyItems,
	...slotProps
}: Props & SlotProps) {
	return createElement(
		asChild ? Slot : as,
		{
			...slotProps,
			className: clsx(slotProps.className, styles.grid),
			style: mergeStyleSources(
				slotProps.style,
				toCSSVars({
					jsxAlignContent: alignContent,
					jsxAlignItems: alignItems,
					jsxJustifyContent: justifyContent,
					jsxJustifyItems: justifyItems,
					jsxGap: gap > 0 ? `var(--space-${gap})` : gap,
				}),
			),
		},
		children,
	);
}
