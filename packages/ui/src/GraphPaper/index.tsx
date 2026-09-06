import { clsx } from "clsx";
import { createElement, type ElementType } from "react";
import type { PolymorphicProps } from "../utils/types";
import styles from "./styles.module.css";

export type GraphPaperProps<E extends ElementType = "div"> =
	PolymorphicProps<E> & {
		as?: E;
	};

export function GraphPaper<E extends ElementType = "div">({
	as = "div",
	children,
	className,
	...props
}: GraphPaperProps<E>) {
	return createElement(
		as,
		{ ...props, className: clsx(className, styles.paper) },
		children,
	);
}
