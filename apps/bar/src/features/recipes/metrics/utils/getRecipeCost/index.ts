import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { getLineCost } from "@/features/ingredientLines/utils/getLineCost";

export function getRecipeCost<T extends BaseRecipe>(recipe: T) {
	let isIncomplete = false;

	const total = recipe.lines?.reduce((acc, line) => {
		if (typeof line.ingredient.unitCost !== "number" || !line.unit) {
			isIncomplete = true;
			return acc;
		}

		try {
			switch (line.ingredient.measurementType) {
				case "volume": {
					const cost = getLineCost(line);

					if (typeof cost !== "number") {
						isIncomplete = true;
						return acc;
					}

					return acc + cost;
				}

				default:
					return acc;
			}
		} catch (_) {
			isIncomplete = true;
			return acc;
		}
	}, 0);

	return {
		cost: total ?? 0,
		isIncomplete,
	};
}
