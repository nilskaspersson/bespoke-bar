"use client";

import type { ComponentProps, ReactNode } from "react";
import type { RecipeWithRelations } from "@/db/schema/recipes";
import {
	type CocktailStyleFilter,
	RecipeStyleDistribution,
} from "@/features/recipes/components/RecipeStyleDistribution";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

type Props = {
	recipes: RecipeWithRelations[];
	selectedStyles: CocktailStyleFilter[];
	onSelectedStylesChange: (styles: CocktailStyleFilter[]) => void;
	extras?: ReactNode;
};

export function RecipesStatsBar({
	recipes,
	selectedStyles,
	onSelectedStylesChange,
	extras,
	...props
}: Props & ComponentProps<"section">) {
	function toggleStyles(toToggle: CocktailStyleFilter[]) {
		const allSelected = toToggle.every((s) => selectedStyles.includes(s));
		if (allSelected) {
			const removed = new Set(toToggle);
			onSelectedStylesChange(selectedStyles.filter((s) => !removed.has(s)));
			return;
		}
		const next = [...selectedStyles];
		for (const s of toToggle) {
			if (!next.includes(s)) next.push(s);
		}
		onSelectedStylesChange(next);
	}

	return (
		<Grid as="section" gap={2} aria-label="Recipe overview" {...props}>
			<Flex gap={3} alignItems="flex-end" justifyContent="space-between" wrap>
				<Text as="span" size={1} light compact className={styles.label}>
					Cocktail style spread
				</Text>

				{extras}
			</Flex>

			<RecipeStyleDistribution
				recipes={recipes}
				selectedStyles={selectedStyles}
				onToggleStyles={toggleStyles}
			/>
		</Grid>
	);
}
