import type { Ingredient } from "@/db/schema/ingredients";
import { quantityTextParser } from "@/features/quantity/utils/parseQuantity";
import { unitTextParser } from "@/features/units/utils/parseUnit";

export type TokenType = "quantity" | "unit" | "ingredient" | "recipe-name";

export type Token = {
	type: TokenType;
	text: string;
	start: number;
	end: number;
	valid: boolean;
	ingredientId?: string;
};

export type LineTokenization = {
	tokens: Token[];
	isRecipeName: boolean;
};

export type IngredientIndex = Map<string, string>;

export function buildIngredientIndex(
	ingredients: Ingredient[],
): IngredientIndex {
	const map = new Map<string, string>();
	for (const i of ingredients) {
		map.set(i.name.toLowerCase(), i.id);
	}
	return map;
}

/**
 * Tokenize a single line of recipe input into typed spans with character offsets.
 * Reuses the existing sequential parsers but tracks positions for editor highlighting.
 */
export function tokenizeLine(
	line: string,
	ingredientIndex: IngredientIndex,
): LineTokenization {
	if (!line.trim()) {
		return { tokens: [], isRecipeName: false };
	}

	const tokens: Token[] = [];

	/**
	 * Track the leading whitespace so offsets are relative to the original line.
	 */
	const trimmedLine = line.trimStart();
	const leadingWhitespace = line.length - trimmedLine.length;

	/**
	 * Strip list prefixes (- or *) like userInputToBulkRecipe does
	 */
	const listPrefixMatch = trimmedLine.match(/^[-*]\s*/);
	const prefixLength = listPrefixMatch ? listPrefixMatch[0].length : 0;
	const contentStart = leadingWhitespace + prefixLength;
	const content = trimmedLine.slice(prefixLength).trimEnd();

	if (!content.trim()) {
		return { tokens: [], isRecipeName: false };
	}

	let cursor = contentStart;

	/**
	 * Step 1: Parse quantity
	 */
	const [quantity, quantityRemainder] = quantityTextParser(content);

	if (quantity !== null) {
		const consumed = content.length - quantityRemainder.length;
		const quantityText = content.slice(0, consumed);

		tokens.push({
			type: "quantity",
			text: quantityText,
			start: cursor,
			end: cursor + quantityText.length,
			valid: true,
		});

		cursor += consumed;

		/**
		 * Step 2: Parse unit from the remainder
		 */
		const trimmedForUnit = quantityRemainder.trimStart();
		const whitespaceBeforeUnit =
			quantityRemainder.length - trimmedForUnit.length;
		cursor += whitespaceBeforeUnit;

		const [unit, unitRemainder] = unitTextParser(trimmedForUnit);

		if (unit !== null) {
			const unitConsumed = trimmedForUnit.length - unitRemainder.length;
			const unitText = trimmedForUnit.slice(0, unitConsumed).trimEnd();

			tokens.push({
				type: "unit",
				text: unitText,
				start: cursor,
				end: cursor + unitText.length,
				valid: true,
			});

			cursor += unitConsumed;

			/**
			 * Step 3: Ingredient is the rest
			 */
			const trimmedForIngredient = unitRemainder.trimStart();
			const whitespaceBeforeIngredient =
				unitRemainder.length - trimmedForIngredient.length;
			cursor += whitespaceBeforeIngredient;

			if (trimmedForIngredient) {
				const ingredientName = trimmedForIngredient.trim();

				tokens.push({
					type: "ingredient",
					text: ingredientName,
					start: cursor,
					end: cursor + ingredientName.length,
					valid: true,
					ingredientId: ingredientIndex.get(ingredientName.toLowerCase()),
				});
			}
		} else {
			/**
			 * No valid unit found — everything after quantity is the ingredient.
			 * If the remainder starts with something that looks like it could be a unit
			 * (letters before a space), it's still invalid. We treat the whole rest as
			 * ingredient for simplicity, same as the existing parser.
			 */
			const ingredientText = trimmedForUnit.trim();

			if (ingredientText) {
				tokens.push({
					type: "ingredient",
					text: ingredientText,
					start: cursor,
					end: cursor + ingredientText.length,
					valid: true,
					ingredientId: ingredientIndex.get(ingredientText.toLowerCase()),
				});
			}
		}

		return { tokens, isRecipeName: false };
	}

	/**
	 * No quantity found — this line is a recipe name
	 */
	const nameText = content.trim();

	tokens.push({
		type: "recipe-name",
		text: nameText,
		start: cursor,
		end: cursor + nameText.length,
		valid: true,
	});

	return { tokens, isRecipeName: true };
}
