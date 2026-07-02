import { clsx } from "clsx";
import { createElement, type ElementType, type ReactNode } from "react";
import type { PolymorphicProps } from "../utils/types";
import styles from "./styles.module.css";

export type PanelProps<E extends ElementType = "section"> =
	PolymorphicProps<E> & {
		as?: E;
		header?: ReactNode;
		footer?: ReactNode;
	};

export function Panel<E extends ElementType = "section">({
	as = "section",
	header,
	footer,
	children,
	className,
	...props
}: PanelProps<E>) {
	return createElement(
		as,
		{ ...props, className: clsx(className, styles.panel) },
		header != null ? <header className={styles.header}>{header}</header> : null,
		<div className={styles.box}>{children}</div>,
		footer != null ? <footer className={styles.footer}>{footer}</footer> : null,
	);
}
