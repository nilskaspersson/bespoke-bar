"use client";

import type { RecipeWithRelations } from "@bespoke/schema/schema/recipes";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import {
	type ComponentProps,
	type ReactNode,
	useCallback,
	useMemo,
} from "react";
import {
	CocktailStyleDistribution,
	type CocktailStyleFilter,
} from "@/features/recipes/components/CocktailStyleDistribution";
import { CocktailStyleLegend } from "@/features/recipes/components/CocktailStyleLegend";
import { getCocktailStyleEntries } from "@/features/recipes/utils/cocktailStyleEntries";

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
	children,
	...props
}: Props & ComponentProps<"section">) {
	const items = useMemo(() => getCocktailStyleEntries(recipes), [recipes]);

	const toggleStyles = useCallback(
		(toToggle: CocktailStyleFilter[]) => {
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
		},
		[selectedStyles, onSelectedStylesChange],
	);

	return (
		<Grid as="section" gap={2} aria-label="Usage overview" {...props}>
			<Flex gap={3} alignItems="flex-end" justifyContent="flex-end" wrap>
				{children}
			</Flex>

			<CocktailStyleDistribution
				items={items}
				selectedStyles={selectedStyles}
				onToggleStyles={toggleStyles}
			>
				<CocktailStyleLegend
					items={items}
					selectedStyles={selectedStyles}
					onToggleStyles={toggleStyles}
				/>
			</CocktailStyleDistribution>
		</Grid>
	);
}
