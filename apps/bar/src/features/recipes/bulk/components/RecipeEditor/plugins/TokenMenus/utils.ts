import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import type { Unit } from "@bespoke/schema/schema/units";
import { MenuOption } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $getRoot, $getSelection, $isRangeSelection } from "lexical";
import type { RefObject } from "react";
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

/**
 * Wraps a typeahead trigger so it only fires when the editor's root text
 * content has actually changed since the previous evaluation.
 *
 * `LexicalTypeaheadMenuPlugin` re-runs the trigger on every Lexical update
 * — including selection-only updates from clicking, focusing, or the
 * caret returning to a position where the plugin *would* match. That
 * makes the menu re-open after the user dismissed it by clicking away,
 * because the underlying text hasn't changed and the plugin thinks it's
 * still a valid match.
 *
 * Gating on "the root text is different from last time" means:
 *   - typing → text changes → trigger fires
 *   - cursor move / focus return → text unchanged → suppressed
 *   - type one more character after dismissing → text differs → fires again
 *
 * State lives in a closure per factory call, so each typeahead plugin
 * holds its own "last seen text" and can't trample the other.
 *
 * `historicRef` (true during undo/redo) gates those updates out too — their
 * restored states would otherwise re-fire the trigger at a query boundary.
 */
export function gateOnTextChange<T>(
	compute: (text: string) => T | null,
	historicRef: RefObject<boolean>,
): (text: string) => T | null {
	let lastRootText = "";
	return (text) => {
		const rootText = $getRoot().getTextContent();
		const changed = rootText !== lastRootText;
		lastRootText = rootText;
		if (!changed || historicRef.current) return null;
		return compute(text);
	};
}

/**
 * Build a Lexical typeahead trigger from the recipe syntax:
 *   <quantity> <unit> <ingredient text>
 *
 * The trigger fires once the user has typed a valid quantity, a valid
 * unit, and at least one character of ingredient text that doesn't
 * exactly match an existing ingredient name.
 */
export function createIngredientTriggerFn(
	knownIngredientNames: Set<string>,
	historicRef: RefObject<boolean>,
) {
	return gateOnTextChange((rawText) => {
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

		/**
		 * Trim tail to match lexical internals
		 */
		const text = rawText.trimEnd();
		const [quantity, quantityRemainder] = quantityTextParser(text);
		if (quantity === null) return null;

		const [unit, unitRemainder] = unitTextParser(quantityRemainder.trimStart());
		if (unit === null) return null;

		const ingredientCore = unitRemainder.trimStart();
		if (ingredientCore.length === 0) return null;

		if (knownIngredientNames.has(normalizeInput(ingredientCore))) return null;

		const leadOffset = text.length - ingredientCore.length;
		const ingredientText = rawText.slice(leadOffset);

		return {
			leadOffset,
			matchingString: ingredientText,
			replaceableString: ingredientText,
		};
	}, historicRef);
}
