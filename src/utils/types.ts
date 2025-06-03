import type { ComponentProps, ElementType, JSX } from "react";

/**
 * If E is a regular element ("div", "section"), use the node's instrinsic props.
 * Otherwise, it's a custom component. Invoke ComponentProps to derive its props.
 */
export type PolymorphicProps<E extends ElementType> =
	E extends keyof JSX.IntrinsicElements
		? JSX.IntrinsicElements[E]
		: ComponentProps<E>;

/**
 * Creates a new object without preserving the derivation history
 */
export type Identity<T> = {
	[K in keyof T]: T[K];
} & {};

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type Scale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
