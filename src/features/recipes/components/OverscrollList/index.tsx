import { clsx } from "clsx";
import type { ComponentProps, Ref } from "react";
import { mergeStyleSources, toCSSVars } from "@/utils/styles";
import type { Scale } from "@/utils/types";
import styles from "./styles.module.css";

export function OverscrollList({
	children,
	className,
	padding,
	gap = 4,
	style,
	ref,
}: {
	children: React.ReactNode;
	padding: Scale;
	gap?: Scale;
	className?: string;
	style?: React.CSSProperties;
	ref?: Ref<HTMLUListElement>;
}) {
	return (
		<ul
			ref={ref}
			className={clsx(styles.list, className)}
			style={mergeStyleSources(
				style,
				toCSSVars({
					jsxPadding: `var(--space-${padding})`,
					jsxGap: gap > 0 ? `var(--space-${gap})` : gap,
				}),
			)}
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
