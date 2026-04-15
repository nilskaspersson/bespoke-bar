import { createDOMRange } from "@lexical/selection";
import {
	$isTextNode,
	type LexicalEditor,
	type ParagraphNode,
	type TextNode,
} from "lexical";

export type TextNodeAtOffset = { node: TextNode; offset: number };

/**
 * Walk a paragraph's `TextNode` children to find the one that contains
 * the paragraph-relative character `offset`, returning both the node and
 * the offset within it. `matchAtEnd` controls whether the search is
 * inclusive of the offset at a node's end boundary — `true` for a
 * Range-end lookup (so an offset exactly at the boundary still resolves
 * to the node before it), `false` for a Range-start lookup.
 */
export function locateTextNodeAtOffset(
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
	const anchor = locateTextNodeAtOffset(paragraph, start, false);
	const focus = locateTextNodeAtOffset(paragraph, end, true);
	if (!anchor || !focus) return null;
	return createDOMRange(
		editor,
		anchor.node,
		anchor.offset,
		focus.node,
		focus.offset,
	);
}
