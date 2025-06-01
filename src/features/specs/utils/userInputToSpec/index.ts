import type { UserInputSpec } from "@/db/schema/specs";
import { parseIngredient } from "@/features/ingredients/utils/parseIngredient";
import { parseQuantity } from "@/features/quantity/utils/parseQuantity";
import { parseUnit } from "@/features/units/utils/parseUnit";
import { sequencedParsers } from "@/utils/sequencedParsers";

export function userInputToSpec(userInput: string): UserInputSpec | null {
	/**
	 * Let's not try to parse something that's obviously too long
	 */
	if (userInput.length > 1000) {
		return null;
	}

	const [quantity, unit, ingredient] = sequencedParsers(
		parseQuantity,
		parseUnit,
		parseIngredient,
	)(userInput);

	if (!ingredient) {
		return null;
	}

	const spec: UserInputSpec = {
		quantity,
		unit,
		ingredient,
	};

	return spec;
}
