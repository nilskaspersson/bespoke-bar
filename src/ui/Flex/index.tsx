import { clsx } from "clsx";
import { createElement, type ElementType } from "react";
import { mergeStyleSources, toCSSVars } from "@/utils/styles";
import type { PolymorphicProps, Scale } from "@/utils/types";
import styles from "./styles.module.css";

type Props<E extends ElementType> = {
	alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
	as?: E;
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

export function Flex<E extends ElementType = "div">({
	alignItems = "flex-start",
	as = "div",
	children,
	direction = "row",
	gap,
	justifyContent,
	wrap,
	...slotProps
}: PolymorphicProps<E> & Props<E>) {
	return createElement(
		as,
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
					jsxGap: gap != null ? `var(--space-${gap})` : 0,
				}),
			),
		},
		children,
	);
}
