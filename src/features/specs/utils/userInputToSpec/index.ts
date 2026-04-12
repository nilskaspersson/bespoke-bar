import type { Ingredient } from "@/db/schema/ingredients";
import type { DraftSpecWithDraftIngredient } from "@/db/schema/specs";
import type { IngredientIndex } from "@/features/ingredients/utils/buildIngredientIndex";
import { getDefaultIngredientData } from "@/features/ingredients/utils/getDefaultIngredientData";
import { ingredientTextParser } from "@/features/ingredients/utils/parseIngredient";
import { quantityTextParser } from "@/features/quantity/utils/parseQuantity";
import { unitTextParser } from "@/features/units/utils/parseUnit";
import { normalizeInput } from "@/utils";
import { sequencedParsers } from "@/utils/sequencedParsers";

export function userInputToSpec(
	userInput: string,
	ingredients: Ingredient[],
	ingredientIndex?: IngredientIndex,
): DraftSpecWithDraftIngredient | null {
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

	const normalized = normalizeInput(ingredientName);
	const ingredient = ingredientIndex
		? ingredientIndex.get(normalized)
		: ingredients.find(({ name }) => normalizeInput(name) === normalized);

	const spec: DraftSpecWithDraftIngredient = {
		quantity,
		unit,
		ingredientId: ingredient?.id,
		ingredient: ingredient ?? getDefaultIngredientData(ingredientName, unit),
	};

	return spec;
}
