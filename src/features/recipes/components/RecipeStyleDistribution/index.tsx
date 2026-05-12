"use client";

import { clsx } from "clsx";
import { useMemo } from "react";
import type { RecipeWithRelations } from "@/db/schema/recipes";
import {
	type CocktailStyleFilter,
	getCocktailStyleColor,
	getCocktailStyleLabel,
	UNCLASSIFIED_COCKTAIL_STYLE_COLOR,
} from "@/features/recipes/constants";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

const TOP_N = 5;

export type { CocktailStyleFilter };

type Segment = {
	key: string;
	label: string;
	count: number;
	color: string;
	styles: CocktailStyleFilter[];
};

type Props = {
	recipes: RecipeWithRelations[];
	selectedStyles: CocktailStyleFilter[];
	onToggleStyles: (styles: CocktailStyleFilter[]) => void;
};

export function RecipeStyleDistribution({
	recipes,
	selectedStyles,
	onToggleStyles,
}: Props) {
	const segments = useMemo<Segment[]>(() => {
		const counts = new Map<CocktailStyleFilter, number>();
		for (const recipe of recipes) {
			const key = recipe.style ?? null;
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}

		const ranked = [...counts.entries()].sort(([, a], [, b]) => b - a);
		const top = ranked.slice(0, TOP_N);
		const rest = ranked.slice(TOP_N);

		const result: Segment[] = top.map(([style, count]) => ({
			key: style ?? "unclassified",
			label: getCocktailStyleLabel(style),
			count,
			color: getCocktailStyleColor(style),
			styles: [style],
		}));

		if (rest.length > 0) {
			const restTotal = rest.reduce((sum, [, count]) => sum + count, 0);
			result.push({
				key: "other-grouped",
				label: `Other (${rest.length})`,
				count: restTotal,
				color: UNCLASSIFIED_COCKTAIL_STYLE_COLOR,
				styles: rest.map(([s]) => s),
			});
		}

		return result;
	}, [recipes]);

	const selectedSet = useMemo(() => new Set(selectedStyles), [selectedStyles]);
	const hasSelection = selectedSet.size > 0;

	if (segments.length === 0) return null;

	function isSegmentActive(segment: Segment): boolean {
		return segment.styles.every((s) => selectedSet.has(s));
	}

	return (
		<div className={styles.distribution}>
			<div className={styles.bar}>
				{segments.map((seg) => {
					const active = isSegmentActive(seg);
					return (
						<button
							type="button"
							key={seg.key}
							onClick={() => onToggleStyles(seg.styles)}
							className={clsx(styles.segment, {
								[styles.segmentActive]: active,
								[styles.segmentInactive]: hasSelection && !active,
							})}
							style={{
								flexGrow: seg.count,
								backgroundColor: seg.color,
							}}
							aria-pressed={active}
							title={`${seg.label}: ${seg.count}`}
						>
							<span className="sr-only">
								{seg.label}: {seg.count}
							</span>
						</button>
					);
				})}
			</div>

			<ul className={styles.legend}>
				{segments.map((seg) => {
					const active = isSegmentActive(seg);
					return (
						<li key={seg.key}>
							<button
								type="button"
								onClick={() => onToggleStyles(seg.styles)}
								className={clsx(styles.legendItem, {
									[styles.legendItemActive]: active,
									[styles.legendItemInactive]: hasSelection && !active,
								})}
								aria-pressed={active}
							>
								<span
									className={styles.dot}
									style={{ backgroundColor: seg.color }}
									aria-hidden
								/>
								<Text as="span" size={1} compact>
									{seg.label}
								</Text>
								<Text as="span" size={1} weight={700} compact>
									{seg.count}
								</Text>
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
