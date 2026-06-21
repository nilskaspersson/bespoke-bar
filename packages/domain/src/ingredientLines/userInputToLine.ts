import type { DraftIngredientLineWithDraftIngredient } from "@bespoke/schema/schema/ingredientLines";
import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import type { IngredientIndex } from "../ingredients/buildIngredientIndex";
import { getDefaultIngredientData } from "../ingredients/getDefaultIngredientData";
import { ingredientTextParser } from "../ingredients/parseIngredient";
import { quantityTextParser } from "../quantity/parseQuantity";
import { unitTextParser } from "../units/parseUnit";
import { sequencedParsers } from "../utils/sequencedParsers";
import { normalizeInput } from "../utils/text";

export function userInputToLine(
	userInput: string,
	ingredients: Ingredient[],
	ingredientIndex?: IngredientIndex,
): DraftIngredientLineWithDraftIngredient | null {
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

	const line: DraftIngredientLineWithDraftIngredient = {
		quantity,
		unit,
		ingredientId: ingredient?.id,
		ingredient: ingredient ?? getDefaultIngredientData(ingredientName, unit),
	};

	return line;
}
