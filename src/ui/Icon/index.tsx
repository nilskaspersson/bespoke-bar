import { clsx } from "clsx";
import type { SVGAttributes } from "react";

import styles from "./styles.module.css";
import type { IconName } from "./types";

type Props = {
	size?: "default" | "tiny" | "small" | "large" | "huge";
	name?: IconName;
};

export function Icon({
	className,
	children,
	name,
	size = "default",
	...props
}: Props & Omit<SVGAttributes<SVGElement>, "color" | "name">) {
	return (
		<svg
			aria-hidden="true"
			{...props}
			className={clsx(className, styles.icon, styles[size])}
		>
			{name ? <use href={`/icons.svg#${name}`} /> : children}
		</svg>
	);
}
