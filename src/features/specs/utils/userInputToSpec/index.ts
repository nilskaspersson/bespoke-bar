import type { DraftSpec } from "@/db/schema/specs";
import { ingredientTextParser } from "@/features/ingredients/utils/parseIngredient";
import { quantityTextParser } from "@/features/quantity/utils/parseQuantity";
import { unitTextParser } from "@/features/units/utils/parseUnit";
import { sequencedParsers } from "@/utils/sequencedParsers";

export function userInputToSpec(userInput: string): DraftSpec | null {
	const trimmedInput = userInput.trim();

	/**
	 * Let's not try to parse something that's obviously too long, or empty
	 */
	if (trimmedInput.length > 1000 || trimmedInput.length === 0) {
		return null;
	}

	const [quantity, unit, ingredientName] = sequencedParsers(
		quantityTextParser,
		unitTextParser,
		ingredientTextParser,
	)(trimmedInput);

	const spec: DraftSpec = {
		quantity,
		unit,
		ingredientName,
	};

	return spec;
}
