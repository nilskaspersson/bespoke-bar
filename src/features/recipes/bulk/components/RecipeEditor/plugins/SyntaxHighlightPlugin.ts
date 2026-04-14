"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getRoot,
	$isLineBreakNode,
	$isParagraphNode,
	$isTextNode,
	HISTORIC_TAG,
	type LexicalEditor,
	type NodeKey,
	type ParagraphNode,
	type TextNode,
} from "lexical";
import { useEffect } from "react";
import type { IngredientIndex } from "@/features/ingredients/utils/buildIngredientIndex";
import {
	type Token,
	tokenizeLine,
} from "@/features/recipes/bulk/utils/tokenizeLine";
import { useRecipeIngredients } from "../hooks/useRecipeIngredients";

const HIGHLIGHT_NAMES = [
	"recipe-quantity",
	"recipe-unit",
	"recipe-ingredient",
	"recipe-known",
	"recipe-invalid",
] as const;

type HighlightGroup = (typeof HIGHLIGHT_NAMES)[number];

const HIGHLIGHT_CSS = `
::highlight(recipe-quantity) { color: var(--iris-11); }
::highlight(recipe-unit) { color: var(--grass-11); }
::highlight(recipe-ingredient) { color: var(--mauve-11); }
::highlight(recipe-known) {
	color: var(--mauve-12);
	text-decoration: underline;
	text-decoration-color: var(--mauve-8);
	text-underline-offset: 3px;
}
::highlight(recipe-invalid) {
	text-decoration: wavy underline;
	text-decoration-color: var(--red-9);
	text-underline-offset: 3px;
}
`;

type LineSegment = {
	text: string;
	textNodes: Array<{ node: TextNode; offsetInLine: number }>;
};

type TokenSpan = {
	group: HighlightGroup;
	segmentIndex: number;
	start: number;
	end: number;
};

type ParagraphCacheEntry = {
	text: string;
	spans: TokenSpan[];
};

/**
 * PlainTextPlugin uses LineBreakNodes (not ParagraphNodes) for Enter,
 * so a single paragraph may contain multiple lines. Split at each
 * LineBreakNode so every line can be tokenized independently.
 */
function getLineSegments(paragraph: ParagraphNode): LineSegment[] {
	const segments: LineSegment[] = [];
	let currentText = "";
	let currentNodes: LineSegment["textNodes"] = [];

	for (const child of paragraph.getChildren()) {
		if ($isLineBreakNode(child)) {
			segments.push({ text: currentText, textNodes: currentNodes });
			currentText = "";
			currentNodes = [];
		} else if ($isTextNode(child)) {
			currentNodes.push({ node: child, offsetInLine: currentText.length });
			currentText += child.getTextContent();
		}
	}

	segments.push({ text: currentText, textNodes: currentNodes });
	return segments;
}

/**
 * Create a DOM Range for the given character offsets within a line segment.
 * Uses Lexical's node-to-DOM mapping to find the correct DOM text nodes.
 */
function createDOMRange(
	editor: LexicalEditor,
	segment: LineSegment,
	start: number,
	end: number,
): Range | null {
	let startContainer: Text | null = null;
	let startOffset = 0;
	let endContainer: Text | null = null;
	let endOffset = 0;

	for (const { node, offsetInLine } of segment.textNodes) {
		const endOfNode = offsetInLine + node.getTextContentSize();

		if (!startContainer && endOfNode > start) {
			const dom = editor.getElementByKey(node.getKey());
			const text = dom?.firstChild;
			if (text instanceof Text) {
				startContainer = text;
				startOffset = start - offsetInLine;
			}
		}

		if (!endContainer && endOfNode >= end) {
			const dom = editor.getElementByKey(node.getKey());
			const text = dom?.firstChild;
			if (text instanceof Text) {
				endContainer = text;
				endOffset = end - offsetInLine;
			}
			break;
		}
	}

	if (!startContainer || !endContainer) {
		return null;
	}

	const range = new Range();
	range.setStart(startContainer, startOffset);
	range.setEnd(endContainer, endOffset);
	return range;
}

function getHighlightGroup(token: Token): HighlightGroup | null {
	switch (token.type) {
		case "quantity":
			return "recipe-quantity";
		case "unit":
			return token.valid ? "recipe-unit" : "recipe-invalid";
		case "ingredient":
			return token.ingredientId ? "recipe-known" : "recipe-ingredient";
		default:
			return null;
	}
}

function tokenizeParagraph(
	paragraph: ParagraphNode,
	ingredientIndex: IngredientIndex,
): { segments: LineSegment[]; spans: TokenSpan[]; text: string } {
	const segments = getLineSegments(paragraph);
	const spans: TokenSpan[] = [];
	segments.forEach((segment, segmentIndex) => {
		if (!segment.text.trim()) return;
		const { tokens } = tokenizeLine(segment.text, ingredientIndex);
		for (const token of tokens) {
			const group = getHighlightGroup(token);
			if (!group) continue;
			spans.push({ group, segmentIndex, start: token.start, end: token.end });
		}
	});
	return { segments, spans, text: paragraph.getTextContent() };
}

export function SyntaxHighlightPlugin() {
	const [editor] = useLexicalComposerContext();
	const { ingredientIndex } = useRecipeIngredients();

	useEffect(() => {
		const style = document.createElement("style");
		style.setAttribute("data-recipe-highlights", "");
		style.textContent = HIGHLIGHT_CSS;
		document.head.appendChild(style);
		return () => {
			style.remove();
			for (const name of HIGHLIGHT_NAMES) {
				CSS.highlights?.delete(name);
			}
		};
	}, []);

	useEffect(() => {
		if (!CSS.highlights) return;

		/**
		 * Per-paragraph token cache keyed by NodeKey. Avoids re-tokenizing
		 * paragraphs whose text hasn't changed — for a 50-line recipe where
		 * only one line was edited, we skip 49 parser passes on every
		 * keystroke. DOM Ranges must always be rebuilt (offsets don't
		 * auto-track text mutations), but range construction is much
		 * cheaper than tokenization.
		 */
		const cache = new Map<NodeKey, ParagraphCacheEntry>();

		const updateHighlights = () => {
			editor.getEditorState().read(() => {
				const root = $getRoot();
				const ranges = new Map<HighlightGroup, Range[]>();
				for (const name of HIGHLIGHT_NAMES) ranges.set(name, []);
				const liveKeys = new Set<NodeKey>();

				for (const child of root.getChildren()) {
					if (!$isParagraphNode(child)) continue;
					const key = child.getKey();
					liveKeys.add(key);

					const currentText = child.getTextContent();
					let entry = cache.get(key);
					let segments: LineSegment[];

					if (entry && entry.text === currentText) {
						segments = getLineSegments(child);
					} else {
						const tokenized = tokenizeParagraph(child, ingredientIndex);
						entry = { text: tokenized.text, spans: tokenized.spans };
						cache.set(key, entry);
						segments = tokenized.segments;
					}

					for (const span of entry.spans) {
						const segment = segments[span.segmentIndex];
						if (!segment) continue;
						const range = createDOMRange(editor, segment, span.start, span.end);
						if (range) ranges.get(span.group)?.push(range);
					}
				}

				for (const key of cache.keys()) {
					if (!liveKeys.has(key)) cache.delete(key);
				}

				for (const name of HIGHLIGHT_NAMES) {
					const group = ranges.get(name);
					if (group && group.length > 0) {
						CSS.highlights.set(name, new Highlight(...group));
					} else {
						CSS.highlights.delete(name);
					}
				}
			});
		};

		updateHighlights();

		/**
		 * Fire on text mutation only. `dirtyLeaves` holds the TextNode /
		 * LineBreakNode keys that changed — selection-only updates leave it
		 * empty, so we skip those without having to diff the full root text.
		 * Unchanged paragraphs short-circuit inside updateHighlights via the
		 * per-paragraph cache.
		 *
		 * Undo / redo are a special case: `HistoryPlugin` rolls state back via
		 * `setEditorState`, which replaces the tree wholesale and reports no
		 * dirty leaves. We detect that via the `HISTORIC_TAG` and force a
		 * full rebuild — after a state swap, node keys may differ from the
		 * cached ones, so we also drop the cache to avoid stale hits.
		 */
		return editor.registerUpdateListener(({ dirtyLeaves, tags }) => {
			if (tags.has(HISTORIC_TAG)) {
				cache.clear();
				updateHighlights();
				return;
			}
			if (dirtyLeaves.size === 0) return;
			updateHighlights();
		});
	}, [editor, ingredientIndex]);

	return null;
}
