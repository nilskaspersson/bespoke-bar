import type { DraftIngredientLineWithDraftIngredient } from "@/db/schema/ingredientLines";
import { DB_UNIT_TO_LIB_UNIT } from "@/features/units/constants";
import { convert } from "@/features/units/utils/convert";

export function getLineCost<T extends DraftIngredientLineWithDraftIngredient>(
	line: T,
) {
	if (typeof line.ingredient.unitCost !== "number" || !line.unit) {
		return null;
	}

	const libUnit = DB_UNIT_TO_LIB_UNIT.get(line.unit);

	if (!libUnit) {
		return null;
	}

	const litersUsed = convert(line.quantity ?? 1)
		.from(libUnit)
		.to("l");

	const lineCost = litersUsed * line.ingredient.unitCost;

	return lineCost;
}
