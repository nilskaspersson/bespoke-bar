"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_HIGH,
	INSERT_PARAGRAPH_COMMAND,
	KEY_ENTER_COMMAND,
} from "lexical";
import { useEffect } from "react";

/**
 * PlainTextPlugin handles Enter by inserting a LineBreakNode within the same
 * paragraph. We need separate ParagraphNodes so each line can be independently
 * tokenized for syntax highlighting. This plugin overrides that behavior at a
 * higher priority. It also swallows Enter when a modifier key is held so that
 * shortcuts like ⌘↵ submit the form without inserting a paragraph break.
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
		);
	}, [editor]);

	return null;
}
