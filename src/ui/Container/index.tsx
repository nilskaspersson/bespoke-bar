import { clsx } from "clsx";
import { createElement, type ElementType } from "react";
import type { PolymorphicProps } from "@/utils/types";
import styles from "./styles.module.css";

type Props<E extends ElementType> = {
	as?: E;
	padding?: boolean;
};

export function Container<E extends ElementType = "div">({
	as = "div",
	className,
	children,
	padding = true,
	...props
}: PolymorphicProps<E> & Props<E>) {
	return createElement(
		as,
		{
			...props,
			className: clsx(className, styles.container, {
				[styles.withPadding]: padding,
			}),
		},
		children,
	);
}
