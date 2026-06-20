import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { mergeStyleSources, toCSSVars } from "@/utils/styles";
import type { Scale } from "@/utils/types";
import styles from "./styles.module.css";

type Props = {
	size?: Scale;
};

export function Meter({
	className,
	max = 1,
	size = 2,
	style,
	...props
}: Props & ComponentProps<"meter">) {
	return (
		<meter
			{...props}
			max={max}
			className={clsx(className, styles.meter)}
			style={mergeStyleSources(
				style,
				toCSSVars({ jsxSize: `var(--space-${size})` }),
			)}
		/>
	);
}
