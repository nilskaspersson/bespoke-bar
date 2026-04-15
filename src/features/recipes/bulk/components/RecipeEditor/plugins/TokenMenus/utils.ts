import { MenuOption } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $getSelection, $isRangeSelection } from "lexical";
import type { Ingredient } from "@/db/schema/ingredients";
import type { Unit } from "@/db/schema/units";
import { quantityTextParser } from "@/features/quantity/utils/parseQuantity";
import { unitTextParser } from "@/features/units/utils/parseUnit";
import { normalizeInput } from "@/utils";

export const MAX_TYPEAHEAD_OPTIONS = 10;

export type IngredientMenuOption = MenuOption & { ingredient: Ingredient };
export type UnitMenuOption = MenuOption & { unit: Unit };

export function createIngredientMenuOption(
	ingredient: Ingredient,
): IngredientMenuOption {
	return Object.assign(new MenuOption(ingredient.id), { ingredient });
}

export function createUnitMenuOption(unit: Unit): UnitMenuOption {
	return Object.assign(new MenuOption(unit), { unit });
}

export function formatAbv(abv: number | null): string | null {
	if (abv === null) return null;
	return `${(abv * 100).toFixed(0)}%`;
}

/**
 * Build a Lexical typeahead trigger from the recipe syntax:
 *   <quantity> <unit> <ingredient text>
 *
 * The trigger fires once the user has typed a valid quantity, a valid
 * unit, and at least one character of ingredient text that doesn't
 * exactly match an existing ingredient name.
 */
export function createIngredientTriggerFn(knownIngredientNames: Set<string>) {
	return (text: string) => {
		/**
		 * Only fire when the cursor is at the end of its TextNode — i.e. the user
		 * is actively appending. Clicking into the middle of an existing ingredient
		 * token should not pop the typing menu (the browsing menu handles that).
		 */
		const selection = $getSelection();
		if (!$isRangeSelection(selection) || !selection.isCollapsed()) return null;
		const anchor = selection.anchor;
		if (anchor.type !== "text") return null;
		if (anchor.offset !== anchor.getNode().getTextContentSize()) return null;

		const [quantity, quantityRemainder] = quantityTextParser(text);
		if (quantity === null) return null;

		const [unit, unitRemainder] = unitTextParser(quantityRemainder.trimStart());
		if (unit === null) return null;

		const ingredientText = unitRemainder.trimStart();
		if (ingredientText.length === 0) return null;

		if (knownIngredientNames.has(normalizeInput(ingredientText))) return null;

		return {
			leadOffset: text.length - ingredientText.length,
			matchingString: ingredientText,
			replaceableString: ingredientText,
		};
	};
}
