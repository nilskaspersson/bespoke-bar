"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { useEffect, useRef } from "react";

export function TextExtractionPlugin({
	onTextChange,
}: {
	onTextChange: (text: string) => void;
}) {
	const [editor] = useLexicalComposerContext();
	const prevTextRef = useRef("");

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				const text = $getRoot()
					.getChildren()
					.map((child) => child.getTextContent())
					.join("\n");
				if (text === prevTextRef.current) return;
				prevTextRef.current = text;
				onTextChange(text);
			});
		});
	}, [editor, onTextChange]);

	return null;
}
