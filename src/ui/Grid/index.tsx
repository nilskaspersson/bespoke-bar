import { clsx } from "clsx";
import { createElement, type ElementType } from "react";
import { mergeStyleSources, toCSSVars } from "@/utils/styles";
import type { PolymorphicProps, Scale } from "@/utils/types";
import styles from "./styles.module.css";

export type GridProps<E extends ElementType = "div"> = PolymorphicProps<E> & {
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
	gap,
	inline,
	justifyContent,
	justifyItems,
	...slotProps
}: GridProps<E>) {
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
					jsxGap: gap ? `var(--space-${gap})` : undefined,
				}),
			),
		},
		children,
	);
}
