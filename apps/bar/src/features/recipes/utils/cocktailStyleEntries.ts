import {
	type CocktailStyleFilter,
	getCocktailStyleLabel,
} from "@bespoke/domain/recipes/labels";
import type { RecipeWithRelations } from "@bespoke/schema/schema/recipes";
import { getCocktailStyleColor } from "@/features/recipes/constants";

export type CocktailStyleEntry = {
	style: CocktailStyleFilter;
	label: string;
	count: number;
	color: string;
};

export function getCocktailStyleEntries(
	recipes: Pick<RecipeWithRelations, "style">[],
): CocktailStyleEntry[] {
	const byStyle = new Map<CocktailStyleFilter, CocktailStyleEntry>();

	for (const recipe of recipes) {
		const style = recipe.style ?? null;
		const existing = byStyle.get(style);

		if (!existing) {
			byStyle.set(style, {
				style,
				label: getCocktailStyleLabel(style),
				count: 1,
				color: getCocktailStyleColor(style),
			});

			continue;
		}

		existing.count += 1;
	}

	return [...byStyle.values()].sort((a, b) => b.count - a.count);
}
