import type { DraftSpecWithDraftIngredient } from "@/db/schema/specs";
import { DB_UNIT_TO_LIB_UNIT } from "@/features/units/constants";
import { convert } from "@/features/units/utils/convert";

export function getSpecCost<T extends DraftSpecWithDraftIngredient>(spec: T) {
	if (typeof spec.ingredient.unitCost !== "number" || !spec.unit) {
		return null;
	}

	const libUnit = DB_UNIT_TO_LIB_UNIT.get(spec.unit);

	if (!libUnit) {
		return null;
	}

	const litersUsed = convert(spec.quantity ?? 1)
		.from(libUnit)
		.to("l");

	const specCost = litersUsed * spec.ingredient.unitCost;

	return specCost;
}
