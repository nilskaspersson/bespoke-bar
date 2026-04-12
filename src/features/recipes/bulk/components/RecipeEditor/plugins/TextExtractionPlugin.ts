"use client";

import { useLexicalSubscription } from "@lexical/react/useLexicalSubscription";
import { $getRoot, type LexicalEditor } from "lexical";
import { useEffect } from "react";

function getText(editor: LexicalEditor): string {
	return editor.getEditorState().read(() =>
		$getRoot()
			.getChildren()
			.map((child) => child.getTextContent())
			.join("\n"),
	);
}

const TEXT_SUBSCRIPTION = (editor: LexicalEditor) => ({
	initialValueFn: () => getText(editor),
	subscribe: (callback: (text: string) => void) =>
		editor.registerUpdateListener(() => callback(getText(editor))),
});

export function TextExtractionPlugin({
	onTextChange,
}: {
	onTextChange: (text: string) => void;
}) {
	const text = useLexicalSubscription(TEXT_SUBSCRIPTION);
	useEffect(() => {
		onTextChange(text);
	}, [text, onTextChange]);
	return null;
}
