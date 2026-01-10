import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { mergeStyleSources, toCSSVars } from "@/utils/styles";
import type { Scale } from "@/utils/types";
import styles from "./styles.module.css";

export function OverscrollList({
	children,
	className,
	padding,
	gap = 4,
	style,
	direction = "horizontal",
	...props
}: {
	children: React.ReactNode;
	padding: Scale;
	gap?: Scale;
	direction?: "horizontal" | "vertical";
} & ComponentProps<"ul">) {
	return (
		<ul
			className={clsx(styles.list, className, styles[direction])}
			style={mergeStyleSources(
				style,
				toCSSVars({
					jsxPadding: `var(--space-${padding})`,
					jsxGap: gap > 0 ? `var(--space-${gap})` : gap,
				}),
			)}
			{...props}
		>
			{children}
		</ul>
	);
}

OverscrollList.Item = function OverscrollListItem({
	children,
	className,
	...props
}: {
	className?: string;
	children: React.ReactNode;
} & ComponentProps<"li">) {
	return (
		<li className={clsx(styles.item, className)} {...props}>
			{children}
		</li>
	);
};
