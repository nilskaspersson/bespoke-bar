import { clsx } from "clsx";
import { Grid, type GridProps } from "@/ui/Grid";
import type { SystemColor } from "@/utils/types";
import styles from "./styles.module.css";

export function EmptyArea({
	children,
	className,
	color = "regular",
	...props
}: { children: React.ReactNode } & Omit<GridProps, "color"> & {
		color?: SystemColor;
	}) {
	return (
		<Grid
			as="div"
			gap={4}
			className={clsx(styles.empty, className, styles[color])}
			justifyContent="center"
			justifyItems="center"
			alignContent="center"
			alignItems="center"
			{...props}
		>
			{children}
		</Grid>
	);
}
