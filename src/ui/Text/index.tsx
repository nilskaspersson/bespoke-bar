import { Slot, type SlotProps } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import { createElement, type ElementType } from "react";
import { mergeStyleSources, toCSSVars } from "@/utils/styles";
import type { FontWeight, PolymorphicProps, Scale } from "@/utils/types";
import styles from "./styles.module.css";

export type TextProps<E extends ElementType> = {
	align?: "center" | "left" | "right";
	as?: E;
	asChild?: boolean;
	className?: string;
	compact?: boolean;
	fullWidth?: boolean;
	heavy?: boolean;
	italic?: boolean;
	light?: boolean;
	serif?: boolean;
	size?: Scale;
	truncate?: boolean;
	weight?: FontWeight;
};

export function Text<E extends ElementType = "span">({
	align,
	as = "span",
	asChild,
	children,
	compact,
	fullWidth,
	heavy,
	italic,
	light,
	serif,
	size,
	truncate,
	weight,
	...slotProps
}: PolymorphicProps<E> & TextProps<E> & SlotProps) {
	return createElement(
		asChild ? Slot : as,
		{
			...slotProps,
			className: clsx(slotProps.className, styles.text, {
				[styles.compact]: compact,
				[styles.italic]: italic,
				[styles.light]: light,
				[styles.heavy]: heavy,
				[styles.serif]: serif,
				[styles.truncate]: truncate,
				[styles.fullWidth]: fullWidth,
			}),
			style: mergeStyleSources(
				slotProps.style,
				toCSSVars({
					jsxFontSize: size ? `var(--size-${size})` : undefined,
					jsxFontWeight: weight,
					jsxTextAlign: align,
				}),
			),
		},
		children,
	);
}
