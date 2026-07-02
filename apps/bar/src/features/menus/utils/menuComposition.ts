import { calculateRecipeMetrics } from "@bespoke/domain/recipes/calculateRecipeMetrics";
import type { MenuWithRecipes } from "@bespoke/schema/schema/composite";
import {
	type CocktailStyleEntry,
	getCocktailStyleEntries,
} from "@/features/recipes/utils/cocktailStyleEntries";

export type MenuComposition = {
	count: number;
	abvRange: [number, number] | null;
	priceRange: [number, number] | null;
	styleEntries: CocktailStyleEntry[];
};

function range(values: number[]): [number, number] | null {
	return values.length ? [Math.min(...values), Math.max(...values)] : null;
}

/**
 * Derives the at-a-glance composition stats shown in a menu's masthead — recipe
 * count, ABV range, price range, and cocktail-style distribution — from a menu's
 * stitched entries. Pure; all inputs are already loaded on the detail page.
 */
export function getMenuComposition(menu: MenuWithRecipes): MenuComposition {
	const { entries } = menu;

	const abvs: number[] = [];
	for (const entry of entries) {
		const metrics = calculateRecipeMetrics(entry.recipe);
		if (metrics.finalVolume > 0) {
			abvs.push(metrics.abv);
		}
	}

	const prices = entries
		.map((entry) => entry.price)
		.filter((price): price is number => typeof price === "number");

	return {
		count: entries.length,
		abvRange: range(abvs),
		priceRange: range(prices),
		styleEntries: getCocktailStyleEntries(entries.map((entry) => entry.recipe)),
	};
}
