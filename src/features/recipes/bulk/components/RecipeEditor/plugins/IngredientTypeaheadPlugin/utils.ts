import {
	$getSelection,
	$isLineBreakNode,
	$isRangeSelection,
	$isTextNode,
	type LexicalEditor,
} from "lexical";
import { quantityTextParser } from "@/features/quantity/utils/parseQuantity";
import { unitTextParser } from "@/features/units/utils/parseUnit";

export type MenuMode = "typing" | "browsing";

export type MenuState = {
	mode: MenuMode;
	queryString: string;
};

export type IngredientOption = {
	key: string;
	ingredient: {
		id: string;
		name: string;
		category: string | null;
		abv: number | null;
	};
};

export const MAX_TYPEAHEAD_OPTIONS = 10;

export function formatAbv(abv: number | null): string | null {
	if (abv === null) return null;
	return `${(abv * 100).toFixed(0)}%`;
}

export function preventFocusLoss(e: React.MouseEvent) {
	e.preventDefault();
}

/**
 * Read the current line from the Lexical selection and extract the
 * ingredient query (text after quantity + unit, up to the cursor).
 * Must be called inside `editor.getEditorState().read()`.
 */
export function getIngredientQuery(): {
	matchingString: string;
	cursorAtEnd: boolean;
} | null {
	const selection = $getSelection();
	if (!$isRangeSelection(selection) || !selection.isCollapsed()) return null;

	const anchor = selection.anchor;
	if (anchor.type !== "text") return null;

	const anchorNode = anchor.getNode();
	const paragraph = anchorNode.getParent();
	if (!paragraph) return null;

	let lineText = "";
	let cursorOffset = 0;
	let foundAnchor = false;

	for (const child of paragraph.getChildren()) {
		if ($isLineBreakNode(child)) {
			if (foundAnchor) break;
			lineText = "";
			continue;
		}
		const text = child.getTextContent();
		if (child.is(anchorNode)) {
			cursorOffset = lineText.length + anchor.offset;
			foundAnchor = true;
		}
		lineText += text;
	}

	if (!foundAnchor) return null;

	const textUpToCursor = lineText.slice(0, cursorOffset);
	const [quantity, quantityRemainder] = quantityTextParser(textUpToCursor);
	if (quantity === null) return null;

	const [unit, unitRemainder] = unitTextParser(quantityRemainder.trimStart());
	if (unit === null) return null;

	const ingredientText = unitRemainder.trimStart();
	if (ingredientText.length === 0) return null;

	const restOfLine = lineText.slice(cursorOffset).trimEnd();
	return {
		matchingString: ingredientText,
		cursorAtEnd: restOfLine.length === 0,
	};
}

export function replaceIngredientText(
	editor: LexicalEditor,
	matchingString: string,
	replacement: string,
) {
	editor.update(() => {
		const selection = $getSelection();
		if (!$isRangeSelection(selection) || !selection.isCollapsed()) return;

		const anchor = selection.anchor;
		if (anchor.type !== "text") return;

		const textNode = anchor.getNode();
		const text = textNode.getTextContent();
		const matchStart = text.lastIndexOf(matchingString);
		if (matchStart < 0) return;

		const before = text.slice(0, matchStart);
		textNode.setTextContent(before + replacement);

		let sibling = textNode.getNextSibling();
		while (sibling && $isTextNode(sibling)) {
			const next = sibling.getNextSibling();
			sibling.remove();
			sibling = next;
		}

		const offset = before.length + replacement.length;
		selection.anchor.set(textNode.__key, offset, "text");
		selection.focus.set(textNode.__key, offset, "text");
	});
}
