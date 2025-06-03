import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import { createElement, type ElementType, type PropsWithChildren } from "react";
import type { PolymorphicProps } from "@/utils/types";
import styles from "./styles.module.css";

type Props<E extends ElementType> = {
	as?: E;
	asChild?: boolean;
};

export function Container<E extends ElementType = "div">({
	as = "div",
	asChild,
	className,
	children,
	...props
}: PolymorphicProps<E> & PropsWithChildren<Props<E>>) {
	return createElement(
		asChild ? Slot : as,
		{
			...props,
			className: clsx(className, styles.container),
		},
		children,
	);
}
