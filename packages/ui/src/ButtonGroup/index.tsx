import { clsx } from "clsx";
import type { ComponentProps } from "react";

import styles from "./styles.module.css";

type Props = ComponentProps<"div"> & {
	equalWidth?: boolean;
};

export function ButtonGroup({ className, equalWidth, ...props }: Props) {
	return (
		<div
			{...props}
			className={clsx(className, styles.group, {
				[styles.equalWidth]: equalWidth,
			})}
		/>
	);
}
