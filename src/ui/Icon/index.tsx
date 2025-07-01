import { clsx } from "clsx";
import type { SVGAttributes } from "react";
import { mergeStyleSources, toCSSVars } from "@/utils/styles";
import type { Scale } from "@/utils/types";
import styles from "./styles.module.css";
import type { IconName } from "./types";

type Props = {
	size?: Scale;
	name?: IconName;
};

export function Icon({
	children,
	className,
	name,
	size,
	style,
	...props
}: Props & Omit<SVGAttributes<SVGElement>, "color" | "name">) {
	return (
		<svg
			aria-hidden="true"
			{...props}
			className={clsx(className, styles.icon)}
			style={mergeStyleSources(
				style,
				toCSSVars({
					jsxIconLength:
						typeof size === "number" ? `var(--size-${size})` : undefined,
				}),
			)}
		>
			{name ? <use href={`/icons.svg#${name}`} /> : children}
		</svg>
	);
}
