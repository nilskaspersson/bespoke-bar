"use client";

import type { CocktailStyleFilter } from "@bespoke/domain/recipes/labels";
import { Button } from "@bespoke/ui/Button";
import { Flex } from "@bespoke/ui/Flex";
import { Icon } from "@bespoke/ui/Icon";
import { clsx } from "clsx";
import { useMemo, useState } from "react";
import { CocktailStyleChip } from "@/features/recipes/components/CocktailStyleChip";
import type { CocktailStyleEntry } from "@/features/recipes/utils/cocktailStyleEntries";
import styles from "./styles.module.css";

type Props = {
	items: CocktailStyleEntry[];
	selectedStyles: CocktailStyleFilter[];
	onToggleStyles: (styles: CocktailStyleFilter[]) => void;
};

export function CocktailStyleLegend({
	items,
	selectedStyles,
	onToggleStyles,
}: Props) {
	const selectedSet = useMemo(() => new Set(selectedStyles), [selectedStyles]);
	const hasSelection = selectedSet.size > 0;

	const [expanded, setExpanded] = useState(false);

	if (items.length === 0) return null;

	return (
		<div className={styles.root}>
			<Flex
				as="ul"
				wrap
				gap={0}
				className={clsx(styles.list, {
					[styles.expanded]: expanded,
				})}
			>
				{items.map((item) => {
					const isActive = selectedSet.has(item.style);

					return (
						<li key={item.label}>
							<CocktailStyleChip
								style={item.style}
								count={item.count}
								variant="legend"
								selected={isActive}
								dim={hasSelection && !isActive}
								onClick={() => onToggleStyles([item.style])}
							/>
						</li>
					);
				})}
			</Flex>

			<Button
				onClick={() => setExpanded((value) => !value)}
				className={styles.toggle}
				aria-expanded={expanded}
				rounded
				size="tiny"
				icon
				variant="ghost"
			>
				<Icon name={expanded ? "angle-up" : "angle-down"} size={1} />
			</Button>
		</div>
	);
}
