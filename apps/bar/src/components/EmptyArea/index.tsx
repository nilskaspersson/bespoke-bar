import { Grid, type GridProps } from "@bespoke/ui/Grid";
import type { SystemColor } from "@bespoke/ui/utils/types";
import { clsx } from "clsx";
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
