import { createDOMRange } from "@lexical/selection";
import {
	$isTextNode,
	type LexicalEditor,
	type ParagraphNode,
	type TextNode,
} from "lexical";

type TextNodeAtOffset = { node: TextNode; offset: number };

function locateOffset(
	paragraph: ParagraphNode,
	offset: number,
	matchAtEnd: boolean,
): TextNodeAtOffset | null {
	let cursor = 0;
	for (const child of paragraph.getChildren()) {
		if (!$isTextNode(child)) continue;
		const nodeEnd = cursor + child.getTextContentSize();
		const within = matchAtEnd ? nodeEnd >= offset : nodeEnd > offset;
		if (within) return { node: child, offset: offset - cursor };
		cursor = nodeEnd;
	}
	return null;
}

/**
 * Build a DOM `Range` covering the character offsets `start..end` within a
 * paragraph's concatenated text. Translates paragraph-relative offsets
 * into per-`TextNode` offsets, then hands off to `@lexical/selection`'s
 * `createDOMRange` for the actual DOM resolution (which handles the
 * `<br>` / collapsed-range edge cases we don't want to reimplement).
 * Returns `null` if either boundary can't be resolved — usually because
 * the paragraph contains something other than `TextNode`s at the target
 * offset.
 */
export function createParagraphDOMRange(
	editor: LexicalEditor,
	paragraph: ParagraphNode,
	start: number,
	end: number,
): Range | null {
	const anchor = locateOffset(paragraph, start, false);
	const focus = locateOffset(paragraph, end, true);
	if (!anchor || !focus) return null;
	return createDOMRange(
		editor,
		anchor.node,
		anchor.offset,
		focus.node,
		focus.offset,
	);
}
