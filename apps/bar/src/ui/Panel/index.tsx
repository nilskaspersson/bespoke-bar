import { clsx } from "clsx";
import { createElement, type ElementType, type ReactNode } from "react";
import type { PolymorphicProps } from "@/utils/types";
import styles from "./styles.module.css";

type Props<E extends ElementType> = {
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
}: PolymorphicProps<E> & Props<E>) {
	return createElement(
		as,
		{ ...props, className: clsx(className, styles.panel) },
		header != null ? <header className={styles.header}>{header}</header> : null,
		<div className={styles.box}>{children}</div>,
		footer != null ? <footer className={styles.footer}>{footer}</footer> : null,
	);
}
