"use client";

import { Button } from "@bespoke/ui/Button";
import { Grid, type GridProps } from "@bespoke/ui/Grid";
import { toCSSVars } from "@bespoke/ui/utils/styles";
import { clsx } from "clsx";
import { useMemo } from "react";
import type { CocktailStyleFilter } from "@/features/recipes/constants";
import type { CocktailStyleEntry } from "@/features/recipes/utils/cocktailStyleEntries";
import styles from "./styles.module.css";

export type { CocktailStyleFilter };

type Props = {
	items: CocktailStyleEntry[];
	selectedStyles: CocktailStyleFilter[];
	onToggleStyles: (styles: CocktailStyleFilter[]) => void;
};

export function CocktailStyleDistribution({
	items,
	selectedStyles,
	onToggleStyles,
	children,
	...props
}: GridProps & Props) {
	const selectedSet = useMemo(() => new Set(selectedStyles), [selectedStyles]);
	const hasSelection = selectedSet.size > 0;

	if (items.length === 0) return null;

	return (
		<Grid gap={2} {...props}>
			<div className={styles.bar}>
				{items.map((item) => {
					const isActive = selectedSet.has(item.style);
					return (
						<Button
							key={item.label}
							variant="base"
							onClick={() => onToggleStyles([item.style])}
							className={clsx(styles.segment, {
								[styles.isInactive]: hasSelection && !isActive,
							})}
							style={toCSSVars({
								jsxEntryColor: item.color,
								jsxCount: item.count,
							})}
							aria-pressed={isActive}
							title={`${item.label}: ${item.count}`}
						>
							<span className="sr-only">
								{item.label}: {item.count}
							</span>
						</Button>
					);
				})}
			</div>

			{children}
		</Grid>
	);
}
