"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { useEffect } from "react";

export function TextExtractionPlugin({
	onTextChange,
}: {
	onTextChange: (text: string) => void;
}) {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				const text = $getRoot()
					.getChildren()
					.map((child) => child.getTextContent())
					.join("\n");
				onTextChange(text);
			});
		});
	}, [editor, onTextChange]);

	return null;
}
