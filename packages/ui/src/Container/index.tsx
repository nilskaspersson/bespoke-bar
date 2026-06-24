import { clsx } from "clsx";
import { createElement, type ElementType } from "react";
import type { PolymorphicProps } from "../utils/types";
import styles from "./styles.module.css";

type Props<E extends ElementType> = {
	as?: E;
};

export function Container<E extends ElementType = "div">({
	as = "div",
	className,
	children,
	...props
}: PolymorphicProps<E> & Props<E>) {
	return createElement(
		as,
		{
			...props,
			className: clsx(className, styles.container),
		},
		children,
	);
}
