import type { BaseRecipe } from "@/db/schema/recipes";
import { getSpecCost } from "@/features/specs/utils/getSpecCost";

export function getRecipeCost<T extends BaseRecipe>(recipe: T) {
	let isIncomplete = false;

	const total = recipe.specs?.reduce((acc, spec) => {
		if (typeof spec.ingredient.unitCost !== "number" || !spec.unit) {
			isIncomplete = true;
			return acc;
		}

		try {
			switch (spec.ingredient.measurementType) {
				case "volume": {
					const cost = getSpecCost(spec);

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
