import {
	$isTextNode,
	type LexicalEditor,
	type ParagraphNode,
	type TextNode,
} from "lexical";

export type TextNodeOffset = {
	node: TextNode;
	offsetInParagraph: number;
};

/**
 * Walk a paragraph's children and record each `TextNode` plus its offset
 * within the paragraph's concatenated text. The returned array is used to
 * translate paragraph-relative character offsets into a DOM Range over the
 * correct underlying text nodes — because a paragraph can still hold more
 * than one `TextNode` child in some edge cases (IME, cross-format edits)
 * even after `LineBreakNode` normalization.
 */
export function getParagraphTextNodes(
	paragraph: ParagraphNode,
): TextNodeOffset[] {
	const result: TextNodeOffset[] = [];
	let offset = 0;
	for (const child of paragraph.getChildren()) {
		if ($isTextNode(child)) {
			result.push({ node: child, offsetInParagraph: offset });
			offset += child.getTextContentSize();
		}
	}
	return result;
}

/**
 * Build a DOM Range covering the character offsets `start..end` within a
 * paragraph, using the paragraph's text-node offset map from
 * `getParagraphTextNodes`. Returns `null` if either boundary can't be
 * resolved (missing DOM node, non-Text first child, etc).
 */
export function createParagraphDOMRange(
	editor: LexicalEditor,
	textNodes: TextNodeOffset[],
	start: number,
	end: number,
): Range | null {
	let startContainer: Text | null = null;
	let startOffset = 0;
	let endContainer: Text | null = null;
	let endOffset = 0;

	for (const { node, offsetInParagraph } of textNodes) {
		const nodeEnd = offsetInParagraph + node.getTextContentSize();

		if (!startContainer && nodeEnd > start) {
			const dom = editor.getElementByKey(node.getKey());
			const text = dom?.firstChild;
			if (text instanceof Text) {
				startContainer = text;
				startOffset = start - offsetInParagraph;
			}
		}

		if (!endContainer && nodeEnd >= end) {
			const dom = editor.getElementByKey(node.getKey());
			const text = dom?.firstChild;
			if (text instanceof Text) {
				endContainer = text;
				endOffset = end - offsetInParagraph;
			}
			break;
		}
	}

	if (!startContainer || !endContainer) return null;

	const range = new Range();
	range.setStart(startContainer, startOffset);
	range.setEnd(endContainer, endOffset);
	return range;
}
