"use client";

import { Button, LinkButton } from "@bespoke/ui/Button";
import { Grid, type GridProps } from "@bespoke/ui/Grid";
import { Icon } from "@bespoke/ui/Icon";
import { clsx } from "clsx";
import type { ChangeEvent } from "react";
import { RecipesSearchInput } from "@/features/recipes/components/RecipesSearchInput";
import styles from "./styles.module.css";

type Props = {
	search: string;
	onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
	filtersOpen: boolean;
	onOpenFilters: () => void;
};

export function RecipesListHeader({
	className,
	filtersOpen,
	onOpenFilters,
	onSearchChange,
	search,
	children,
	...props
}: Props & GridProps) {
	return (
		<Grid gap={2} className={clsx(className, styles.root)} {...props}>
			<div className={styles.row}>
				<Button
					icon
					size="large"
					variant="clear"
					color="light"
					aria-label="Filters"
					aria-expanded={filtersOpen}
					onClick={onOpenFilters}
					className={styles.filters}
				>
					<Icon size={4} name="filter" />
				</Button>

				<div className={styles.box}>
					<RecipesSearchInput
						value={search}
						onChange={onSearchChange}
						className={styles.search}
					/>
				</div>

				<LinkButton
					icon
					size="large"
					variant="clear"
					color="light"
					href="/recipes/create"
					className={styles.create}
				>
					<Icon size={4} name="plus" />
				</LinkButton>
			</div>

			{children}
		</Grid>
	);
}
