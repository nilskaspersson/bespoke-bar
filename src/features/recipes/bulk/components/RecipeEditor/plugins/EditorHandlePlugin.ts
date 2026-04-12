"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { type Ref, useImperativeHandle } from "react";

export type RecipeEditorHandle = {
	setDisabled: (disabled: boolean) => void;
};

export function EditorHandlePlugin({ ref }: { ref: Ref<RecipeEditorHandle> }) {
	const [editor] = useLexicalComposerContext();

	useImperativeHandle(
		ref,
		() => ({
			setDisabled(disabled: boolean) {
				editor.setEditable(!disabled);
			},
		}),
		[editor],
	);

	return null;
}
