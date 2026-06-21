import type { UnitSystems } from "@bespoke/domain/units/convert";
import type { DraftIngredientLineWithDraftIngredient } from "@bespoke/schema/schema/ingredientLines";
import { useFormatLineMeasure } from "@/features/ingredientLines/hooks/useFormatLineMeasure";

export function useLinesToText<
	T extends DraftIngredientLineWithDraftIngredient,
>(
	servings: number = 1,
	convertUnits?: UnitSystems | null,
	joiner = "\n",
): (lines: T[] | undefined) => string | null {
	const formatLineMeasure = useFormatLineMeasure();

	return (lines: T[] | undefined) => {
		if (!lines || lines.length === 0) {
			return null;
		}

		return lines
			.map(
				(line) =>
					`${formatLineMeasure({ line, servings, convertUnits }).formatted} ${line.ingredient.name}`,
			)
			.join(joiner);
	};
}
