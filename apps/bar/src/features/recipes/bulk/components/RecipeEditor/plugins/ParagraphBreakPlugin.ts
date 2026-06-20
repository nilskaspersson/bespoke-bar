"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
	$createParagraphNode,
	$getSelection,
	$isParagraphNode,
	$isRangeSelection,
	COMMAND_PRIORITY_HIGH,
	INSERT_PARAGRAPH_COMMAND,
	KEY_ENTER_COMMAND,
	LineBreakNode,
} from "lexical";
import { useEffect } from "react";

/**
 * Enforces the "one paragraph per logical line" invariant the rest of the
 * editor relies on (syntax highlighting, transform actions, ingredient
 * browsing). Two parts:
 *
 * 1. Enter inserts a new ParagraphNode (not a LineBreakNode). PlainTextPlugin
 *    handles Enter by inserting a LineBreakNode within the same paragraph;
 *    we override at a higher priority. The handler also swallows Enter when
 *    a modifier key is held so shortcuts like ⌘↵ can submit the form.
 *
 * 2. Any LineBreakNode that appears inside a paragraph (e.g. from
 *    `insertRawText` during plain-text paste / drop) is rewritten into a
 *    paragraph split. We register a node transform on `LineBreakNode` that
 *    moves the following siblings into a new paragraph and removes the
 *    break. The transform runs within the same update transaction, so the
 *    committed editor state never contains a LineBreakNode — which means
 *    every downstream consumer can treat `paragraph.getTextContent()` as a
 *    single line.
 */
export function ParagraphBreakPlugin() {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return mergeRegister(
			editor.registerCommand(
				KEY_ENTER_COMMAND,
				(event) => {
					if (event && (event.metaKey || event.ctrlKey)) {
						return true;
					}
					return false;
				},
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerCommand(
				INSERT_PARAGRAPH_COMMAND,
				() => {
					const selection = $getSelection();
					if ($isRangeSelection(selection)) {
						selection.insertParagraph();
					}
					return true;
				},
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerNodeTransform(LineBreakNode, (node) => {
				const parent = node.getParent();
				if (!$isParagraphNode(parent)) return;

				const newParagraph = $createParagraphNode();
				for (const sibling of node.getNextSiblings()) {
					newParagraph.append(sibling);
				}
				parent.insertAfter(newParagraph);
				node.remove();
				/**
				 * In plain-text mode, pressing Enter runs
				 * `selection.insertLineBreak()`, which anchors the caret on
				 * the LineBreakNode we just removed. Without this `selectStart`,
				 * Lexical normalizes the stale selection back to the end of
				 * the previous paragraph and the cursor appears to stay put.
				 * Matches the behavior of `selection.insertParagraph()`.
				 */
				newParagraph.selectStart();
			}),
		);
	}, [editor]);

	return null;
}
