"use client";

import { Button } from "@bespoke/ui/Button";
import { Grid, type GridProps } from "@bespoke/ui/Grid";
import { Tooltip } from "@bespoke/ui/Tooltip";
import { toCSSVars } from "@bespoke/ui/utils/styles";
import { clsx } from "clsx";
import { useMemo } from "react";
import type { CocktailStyleFilter } from "@/features/recipes/constants";
import type { CocktailStyleEntry } from "@/features/recipes/utils/cocktailStyleEntries";
import styles from "./styles.module.css";

export type { CocktailStyleFilter };

type Props = {
	items: CocktailStyleEntry[];
	selectedStyles?: CocktailStyleFilter[];
	onToggleStyles?: (styles: CocktailStyleFilter[]) => void;
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

	const isInteractable = typeof onToggleStyles === "function";

	return (
		<Grid gap={2} {...props}>
			<ul className={styles.list}>
				{items.map((item) => {
					const isActive = selectedSet.has(item.style);

					return (
						<li
							key={item.label}
							className={styles.item}
							style={toCSSVars({ jsxCount: item.count })}
						>
							<Tooltip content={`${item.label}: ${item.count}`}>
								<Button
									variant="base"
									onClick={
										isInteractable
											? () => onToggleStyles([item.style])
											: undefined
									}
									className={clsx(styles.segment, {
										[styles.isStatic]: !isInteractable,
										[styles.isInactive]: hasSelection && !isActive,
									})}
									style={toCSSVars({ jsxEntryColor: item.color })}
									aria-pressed={isInteractable ? isActive : undefined}
								>
									<span className="sr-only">
										{item.label}: {item.count}
									</span>
								</Button>
							</Tooltip>
						</li>
					);
				})}
			</ul>

			{children}
		</Grid>
	);
}
