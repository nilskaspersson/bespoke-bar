"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_HIGH,
	INSERT_PARAGRAPH_COMMAND,
} from "lexical";
import { useEffect } from "react";

/**
 * PlainTextPlugin handles Enter by inserting a LineBreakNode within the same
 * paragraph. We need separate ParagraphNodes so each line can be independently
 * tokenized for syntax highlighting. This plugin overrides that behavior at a
 * higher priority.
 */
export function ParagraphBreakPlugin() {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerCommand(
			INSERT_PARAGRAPH_COMMAND,
			() => {
				const selection = $getSelection();
				if ($isRangeSelection(selection)) {
					selection.insertParagraph();
				}
				return true;
			},
			COMMAND_PRIORITY_HIGH,
		);
	}, [editor]);

	return null;
}
