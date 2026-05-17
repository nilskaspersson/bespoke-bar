import type { ComponentProps, ReactNode } from "react";
import { Text } from "@/ui/Text";

import styles from "./styles.module.css";

export function StatsLine({
	children,
	overline,
	...props
}: ComponentProps<"div"> & {
	overline: ReactNode;
}) {
	return (
		<div {...props}>
			<Text as="div" size={0} light compact className={styles.overline}>
				{overline}
			</Text>

			<Text as="div" size={6} heavy weight={700} compact>
				{children}
			</Text>
		</div>
	);
}
