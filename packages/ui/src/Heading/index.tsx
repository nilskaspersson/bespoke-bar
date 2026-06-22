import { clsx } from "clsx";
import { createElement, type HTMLAttributes } from "react";
import { mergeStyleSources, toCSSVars } from "../utils/styles";
import type { HeadingLevel, Scale } from "../utils/types";
import styles from "./styles.module.css";

type Props = {
	align?: "center" | "left" | "right";
	level: HeadingLevel;
	size?: Scale;
	serif?: boolean;
	truncate?: boolean;
	noWrap?: boolean;
};

const HEADING_LEVEL_TO_SCALE = new Map<HeadingLevel, Scale>([
	["h1", 8],
	["h2", 7],
	["h3", 5],
	["h4", 4],
	["h5", 3],
	["h6", 3],
]);

export function Heading({
	children,
	align,
	level,
	size,
	serif,
	truncate,
	noWrap,
	...props
}: Props & HTMLAttributes<HTMLHeadingElement>) {
	return createElement(
		level,
		{
			...props,
			className: clsx(props.className, styles.heading, {
				[styles.serif]: serif,
				[styles.truncate]: truncate,
				[styles.noWrap]: noWrap,
			}),
			style: mergeStyleSources(
				props.style,
				toCSSVars({
					jsxFontSize: `var(--size-${size ? size : HEADING_LEVEL_TO_SCALE.get(level)})`,
					jsxTextAlign: align,
				}),
			),
		},
		children,
	);
}
