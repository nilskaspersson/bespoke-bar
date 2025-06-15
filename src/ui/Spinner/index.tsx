import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

type Props = {
	stroke?: number;
};

export function Spinner({
	stroke = 4,
	...props
}: Props &
	Omit<
		ComponentProps<typeof Icon>,
		"name" | "viewBox" | "children" | "stroke"
	>) {
	const VIEWBOX = 28;
	const RADIUS = VIEWBOX / 2 - stroke / 2;

	return (
		<Icon {...props} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
			<circle
				r={RADIUS}
				strokeWidth={stroke}
				className={clsx(styles.circle, styles.background)}
			/>

			<circle
				r={RADIUS}
				strokeWidth={stroke}
				className={clsx(styles.circle, styles.spinner)}
				pathLength="1"
			/>
		</Icon>
	);
}
