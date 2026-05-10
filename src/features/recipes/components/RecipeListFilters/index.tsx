import type { ComponentProps, ReactNode } from "react";
import { Grid } from "@/ui/Grid";
import styles from "./styles.module.css";

type Props = {
	hero: ReactNode;
	statsBar: ReactNode;
};

export function RecipeListFilters({
	hero,
	statsBar,
	...props
}: Props & ComponentProps<typeof Grid>) {
	return (
		<Grid gap={8} {...props}>
			<div className={styles.heroSlot}>{hero}</div>
			<div className={styles.statsSlot}>{statsBar}</div>
		</Grid>
	);
}
