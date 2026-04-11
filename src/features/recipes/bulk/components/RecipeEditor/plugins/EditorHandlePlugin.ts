"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { type Ref, useImperativeHandle } from "react";

export type RecipeEditorHandle = {
	setText: (text: string) => void;
	getText: () => string;
};

export function EditorHandlePlugin({ ref }: { ref: Ref<RecipeEditorHandle> }) {
	const [editor] = useLexicalComposerContext();

	useImperativeHandle(ref, () => ({
		setText(text: string) {
			editor.update(() => {
				const root = $getRoot();
				root.clear();

				const lines = text.split("\n");

				for (const line of lines) {
					const paragraph = $createParagraphNode();

					if (line) {
						paragraph.append($createTextNode(line));
					}

					root.append(paragraph);
				}
			});
		},
		getText() {
			return editor.getEditorState().read(() =>
				$getRoot()
					.getChildren()
					.map((child) => child.getTextContent())
					.join("\n"),
			);
		},
	}));

	return null;
}
