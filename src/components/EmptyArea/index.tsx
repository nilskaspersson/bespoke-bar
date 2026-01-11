import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Grid } from "@/ui/Grid";
import type { SystemColor } from "@/utils/types";
import styles from "./styles.module.css";

export function EmptyArea({
	children,
	className,
	color = "regular",
	...props
}: { children: React.ReactNode } & Omit<
	ComponentProps<typeof Grid>,
	"color"
> & { color?: SystemColor }) {
	return (
		<Grid
			as="div"
			gap={4}
			className={clsx(styles.empty, className, styles[color])}
			justifyContent="center"
			justifyItems="center"
			{...props}
		>
			{children}
		</Grid>
	);
}
