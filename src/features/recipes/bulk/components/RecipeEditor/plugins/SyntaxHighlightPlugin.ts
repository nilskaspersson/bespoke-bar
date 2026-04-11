"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getRoot,
	$isLineBreakNode,
	$isParagraphNode,
	$isTextNode,
	type LexicalEditor,
	type ParagraphNode,
	type TextNode,
} from "lexical";
import { useEffect, useMemo, useRef } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { buildIngredientIndex } from "@/features/ingredients/utils/buildIngredientIndex";
import {
	type Token,
	tokenizeLine,
} from "@/features/recipes/bulk/utils/tokenizeLine";

const HIGHLIGHT_NAMES = [
	"recipe-quantity",
	"recipe-unit",
	"recipe-ingredient",
	"recipe-known",
	"recipe-invalid",
] as const;

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

type HighlightGroup = (typeof HIGHLIGHT_NAMES)[number];

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

export function SyntaxHighlightPlugin({
	ingredients,
}: {
	ingredients: Ingredient[];
}) {
	const [editor] = useLexicalComposerContext();
	const ingredientIndex = useMemo(
		() => buildIngredientIndex(ingredients),
		[ingredients],
	);
	const prevTextRef = useRef("");

	useEffect(() => {
		const style = document.createElement("style");
		style.setAttribute("data-recipe-highlights", "");
		style.textContent = HIGHLIGHT_CSS;
		document.head.appendChild(style);
		return () => {
			style.remove();
		};
	}, []);

	useEffect(() => {
		if (!CSS.highlights) {
			return;
		}

		return editor.registerUpdateListener(() => {
			const text = editor
				.getEditorState()
				.read(() => $getRoot().getTextContent());
			if (text === prevTextRef.current) return;
			prevTextRef.current = text;

			const ranges = new Map<HighlightGroup, Range[]>();

			for (const name of HIGHLIGHT_NAMES) {
				ranges.set(name, []);
			}

			editor.getEditorState().read(() => {
				const root = $getRoot();

				for (const child of root.getChildren()) {
					if (!$isParagraphNode(child)) {
						continue;
					}

					const segments = getLineSegments(child);
					for (const segment of segments) {
						if (!segment.text.trim()) {
							continue;
						}

						const { tokens } = tokenizeLine(segment.text, ingredientIndex);

						for (const token of tokens) {
							const group = getHighlightGroup(token);

							if (!group) {
								continue;
							}

							const range = createDOMRange(
								editor,
								segment,
								token.start,
								token.end,
							);

							if (range) {
								ranges.get(group)?.push(range);
							}
						}
					}
				}
			});

			for (const name of HIGHLIGHT_NAMES) {
				const group = ranges.get(name);

				if (group && group.length > 0) {
					CSS.highlights.set(name, new Highlight(...group));
				} else {
					CSS.highlights.delete(name);
				}
			}
		});
	}, [editor, ingredientIndex]);

	return null;
}
