import { clsx } from "clsx";
import { createElement, type ElementType, type ReactNode } from "react";
import type { PolymorphicProps } from "../utils/types";
import styles from "./styles.module.css";

export type PanelProps<E extends ElementType = "section"> =
	PolymorphicProps<E> & {
		as?: E;
		header?: ReactNode;
		/**
		 * Replaces the panel's inner box outright — the node given owns the
		 * surface, and `children` is not rendered. For content that already is a
		 * surface (a recipe card), so it doesn't end up boxed inside another one.
		 */
		box?: ReactNode;
		footer?: ReactNode;
	};

export function Panel<E extends ElementType = "section">({
	as = "section",
	header,
	box,
	footer,
	children,
	className,
	...props
}: PanelProps<E>) {
	return createElement(
		as,
		{ ...props, className: clsx(className, styles.panel) },
		header != null ? <header className={styles.header}>{header}</header> : null,
		box ?? <div className={styles.box}>{children}</div>,
		footer != null ? <footer className={styles.footer}>{footer}</footer> : null,
	);
}
