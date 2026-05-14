"use client";

import type { ChangeEvent } from "react";
import { RecipesSearchInput } from "@/features/recipes/components/RecipesSearchInput";
import { Button, LinkButton } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

type Props = {
	search: string;
	onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
	filtersOpen: boolean;
	onOpenFilters: () => void;
};

export function RecipesListHeader({
	search,
	onSearchChange,
	filtersOpen,
	onOpenFilters,
}: Props) {
	return (
		<Grid gap={2}>
			<Flex gap={4} alignItems="center">
				<Button
					icon
					size="large"
					variant="clear"
					color="light"
					aria-label="Filters"
					aria-expanded={filtersOpen}
					onClick={onOpenFilters}
				>
					<Icon size={4} name="filter" />
				</Button>

				<div className={styles.box}>
					<RecipesSearchInput value={search} onChange={onSearchChange} />
				</div>

				<LinkButton
					icon
					size="large"
					variant="clear"
					color="light"
					href="/bar/recipes/create"
				>
					<Icon size={4} name="plus" />
				</LinkButton>
			</Flex>

			<Text as="div" size={1} compact align="center" fullWidth>
				Filter by Recipe name or Ingredient.
			</Text>
		</Grid>
	);
}
