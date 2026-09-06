import type { ComponentProps, ReactNode } from "react";
import { Text, type TextProps } from "../Text";

import styles from "./styles.module.css";

export function StatsLine({
	children,
	overline,
	size = 6,
	...props
}: ComponentProps<"div"> & {
	overline: ReactNode;
} & Pick<TextProps, "size">) {
	return (
		<div {...props}>
			<Text as="div" size={0} light compact className={styles.overline}>
				{overline}
			</Text>

			<Text as="div" size={size} heavy weight={700} compact numeric>
				{children}
			</Text>
		</div>
	);
}
