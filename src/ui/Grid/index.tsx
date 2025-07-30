import { clsx } from "clsx";
import { createElement, type ElementType } from "react";
import { mergeStyleSources, toCSSVars } from "@/utils/styles";
import type { PolymorphicProps, Scale } from "@/utils/types";
import styles from "./styles.module.css";

type Props<E extends ElementType> = {
	alignContent?: "start" | "end" | "center" | "stretch" | "space-between";
	alignItems?: "start" | "end" | "center" | "stretch";
	as?: E;
	gap?: Scale;
	inline?: boolean;
	justifyContent?: "start" | "end" | "center" | "stretch" | "space-between";
	justifyItems?: "start" | "end" | "center" | "stretch" | "baseline";
};

export function Grid<E extends ElementType = "div">({
	alignContent,
	alignItems,
	as = "div",
	children,
	gap = 0,
	inline,
	justifyContent,
	justifyItems,
	...slotProps
}: PolymorphicProps<E> & Props<E>) {
	return createElement(
		as,
		{
			...slotProps,
			className: clsx(slotProps.className, styles.grid, {
				[styles.inline]: inline,
			}),
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
