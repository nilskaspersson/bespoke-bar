import { clsx } from "clsx";
import { createElement, type ElementType } from "react";
import { mergeStyleSources, toCSSVars } from "@/utils/styles";
import type { FontWeight, PolymorphicProps, Scale } from "@/utils/types";
import styles from "./styles.module.css";

export type TextProps<E extends ElementType> = {
	align?: "center" | "left" | "right";
	as?: E;
	balance?: boolean;
	className?: string;
	compact?: boolean;
	fullWidth?: boolean;
	heavy?: boolean;
	italic?: boolean;
	light?: boolean;
	list?: boolean;
	serif?: boolean;
	size?: Scale;
	truncate?: boolean;
	noWrap?: boolean;
	numeric?: boolean;
	weight?: FontWeight;
};

export function Text<E extends ElementType = "span">({
	align,
	as = "span",
	balance,
	children,
	compact,
	fullWidth,
	heavy,
	italic,
	light,
	list,
	serif,
	size,
	truncate,
	noWrap,
	numeric,
	weight,
	...props
}: PolymorphicProps<E> & TextProps<E>) {
	return createElement(
		as,
		{
			...props,
			className: clsx(props.className, styles.text, {
				[styles.compact]: compact,
				[styles.italic]: italic,
				[styles.light]: light,
				[styles.heavy]: heavy,
				[styles.serif]: serif,
				[styles.truncate]: truncate,
				[styles.fullWidth]: fullWidth,
				[styles.list]: list,
				[styles.balance]: balance,
				[styles.noWrap]: noWrap,
				[styles.numeric]: numeric,
			}),
			style: mergeStyleSources(
				props.style,
				toCSSVars({
					jsxFontSize:
						typeof size === "number" ? `var(--size-${size})` : undefined,
					jsxFontWeight: weight,
					jsxTextAlign: align,
				}),
			),
		},
		children,
	);
}
