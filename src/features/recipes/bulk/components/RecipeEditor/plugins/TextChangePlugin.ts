"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, HISTORY_MERGE_TAG } from "lexical";
import { useEffect } from "react";

/**
 * Custom replacement for `<OnChangePlugin onChange={...} ignoreSelectionChange />`
 * that mirrors its filtering rules but fires the callback with the joined
 * line text directly, avoiding a second `editor.getEditorState().read()`
 * pass on every keystroke when the syntax highlighter is already reading
 * state in its own update listener.
 *
 * Gate is the same as OnChangePlugin's `ignoreSelectionChange = true` path:
 * skip pure selection updates (both dirty maps empty) and history-merge
 * tag updates (no real mutation).
 */
export function TextChangePlugin({
	onTextChange,
}: {
	onTextChange: (text: string) => void;
}) {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerUpdateListener(
			({ editorState, dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
				if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
				if (tags.has(HISTORY_MERGE_TAG)) return;
				if (prevEditorState.isEmpty()) return;
				const text = editorState.read(() =>
					$getRoot()
						.getChildren()
						.map((child) => child.getTextContent())
						.join("\n"),
				);
				onTextChange(text);
			},
		);
	}, [editor, onTextChange]);

	return null;
}
