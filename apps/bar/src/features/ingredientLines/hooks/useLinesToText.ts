import type { DraftIngredientLineWithDraftIngredient } from "@/db/schema/ingredientLines";
import { useFormatLineMeasure } from "@/features/ingredientLines/hooks/useFormatLineMeasure";
import type { UnitSystems } from "@/features/units/utils/convert";

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
