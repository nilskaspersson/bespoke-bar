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
import { usePopover } from "@/hooks/usePopover";
import { Lightbox } from "@/ui/Lightbox";
import { Popover } from "@/ui/Popover";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

const LEGEND_TOP_N = 3;

export type { CocktailStyleFilter };

type StyleEntry = {
	style: CocktailStyleFilter;
	label: string;
	count: number;
	color: string;
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
	const entries = useMemo<StyleEntry[]>(() => {
		const counts = new Map<CocktailStyleFilter, number>();
		for (const recipe of recipes) {
			const key = recipe.style ?? null;
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}

		return [...counts.entries()]
			.sort(([, a], [, b]) => b - a)
			.map(([style, count]) => ({
				style,
				label: getCocktailStyleLabel(style),
				count,
				color: getCocktailStyleColor(style),
			}));
	}, [recipes]);

	const top = entries.slice(0, LEGEND_TOP_N);
	const rest = entries.slice(LEGEND_TOP_N);
	const restTotal = rest.reduce((sum, e) => sum + e.count, 0);

	const selectedSet = useMemo(() => new Set(selectedStyles), [selectedStyles]);
	const hasSelection = selectedSet.size > 0;

	const overflowPopover = usePopover({ type: "auto" });

	if (entries.length === 0) return null;

	const restStyles = rest.map((e) => e.style);
	const restAllActive =
		rest.length > 0 && restStyles.every((s) => selectedSet.has(s));

	return (
		<div className={styles.distribution}>
			<div className={styles.bar}>
				{top.map((entry) => {
					const active = selectedSet.has(entry.style);
					return (
						<button
							type="button"
							key={entry.label}
							onClick={() => onToggleStyles([entry.style])}
							className={clsx(styles.segment, {
								[styles.segmentActive]: active,
								[styles.segmentInactive]: hasSelection && !active,
							})}
							style={{
								flexGrow: entry.count,
								backgroundColor: entry.color,
							}}
							aria-pressed={active}
							title={`${entry.label}: ${entry.count}`}
						>
							<span className="sr-only">
								{entry.label}: {entry.count}
							</span>
						</button>
					);
				})}

				{rest.length > 0 ? (
					<button
						type="button"
						onClick={() => onToggleStyles(restStyles)}
						className={clsx(styles.segment, {
							[styles.segmentActive]: restAllActive,
							[styles.segmentInactive]: hasSelection && !restAllActive,
						})}
						style={{
							flexGrow: restTotal,
							backgroundColor: UNCLASSIFIED_COCKTAIL_STYLE_COLOR,
						}}
						aria-pressed={restAllActive}
						title={`Other (${rest.length}): ${restTotal}`}
					>
						<span className="sr-only">
							Other ({rest.length}): {restTotal}
						</span>
					</button>
				) : null}
			</div>

			<ul className={styles.legend}>
				{top.map((entry) => {
					const active = selectedSet.has(entry.style);
					return (
						<li key={entry.label}>
							<button
								type="button"
								onClick={() => onToggleStyles([entry.style])}
								className={clsx(styles.legendItem, {
									[styles.legendItemActive]: active,
									[styles.legendItemInactive]: hasSelection && !active,
								})}
								aria-pressed={active}
							>
								<span
									className={styles.dot}
									style={{ backgroundColor: entry.color }}
									aria-hidden
								/>
								<Text as="span" size={1} compact>
									{entry.label}
								</Text>
								<Text as="span" size={1} weight={700} compact>
									{entry.count}
								</Text>
							</button>
						</li>
					);
				})}

				{rest.length > 0 ? (
					<li>
						<button
							type="button"
							{...overflowPopover.triggerProps}
							className={clsx(styles.legendItem, {
								[styles.legendItemActive]: restAllActive,
								[styles.legendItemInactive]: hasSelection && !restAllActive,
							})}
						>
							<span
								className={styles.dot}
								style={{
									backgroundColor: UNCLASSIFIED_COCKTAIL_STYLE_COLOR,
								}}
								aria-hidden
							/>
							<Text as="span" size={1} compact>
								Other ({rest.length})
							</Text>
							<Text as="span" size={1} weight={700} compact>
								{restTotal}
							</Text>
						</button>

						<Popover
							{...overflowPopover.contentProps}
							position="bottom"
							className={styles.popover}
						>
							<Lightbox className={styles.popoverSurface}>
								<ul className={styles.overflowList}>
									{rest.map((entry) => {
										const active = selectedSet.has(entry.style);
										return (
											<li key={entry.label}>
												<button
													type="button"
													onClick={() => onToggleStyles([entry.style])}
													className={clsx(styles.legendItem, {
														[styles.legendItemActive]: active,
														[styles.legendItemInactive]:
															hasSelection && !active,
													})}
													aria-pressed={active}
												>
													<span
														className={styles.dot}
														style={{ backgroundColor: entry.color }}
														aria-hidden
													/>
													<Text as="span" size={1} compact>
														{entry.label}
													</Text>
													<Text as="span" size={1} weight={700} compact>
														{entry.count}
													</Text>
												</button>
											</li>
										);
									})}
								</ul>
							</Lightbox>
						</Popover>
					</li>
				) : null}
			</ul>
		</div>
	);
}
