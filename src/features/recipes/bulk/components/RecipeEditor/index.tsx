"use client";
"use no memo";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { KEY_ESCAPE_COMMAND } from "lexical";
import type { KeyboardEvent, Ref } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import {
	EditorHandlePlugin,
	type RecipeEditorHandle,
} from "./plugins/EditorHandlePlugin";
import { IngredientTypeaheadPlugin } from "./plugins/IngredientTypeaheadPlugin";
import { ParagraphBreakPlugin } from "./plugins/ParagraphBreakPlugin";
import { SyntaxHighlightPlugin } from "./plugins/SyntaxHighlightPlugin";
import { TextExtractionPlugin } from "./plugins/TextExtractionPlugin";
import styles from "./RecipeEditor.module.css";
import { recipeEditorTheme } from "./theme";

export type { RecipeEditorHandle };

function onError(error: Error) {
	console.error("[RecipeEditor]", error);
}

function EditorContainer({
	ref,
	ingredients,
	onTextChange,
}: {
	ref?: Ref<RecipeEditorHandle>;
	ingredients: Ingredient[];
	onTextChange: (text: string) => void;
}) {
	const [editor] = useLexicalComposerContext();

	function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
		if (e.key === "Escape") {
			e.preventDefault();
			editor.dispatchCommand(KEY_ESCAPE_COMMAND, e.nativeEvent);
			editor.getRootElement()?.focus();
		}
	}

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: keydown forwarded to Lexical command system
		<div className={styles.container} onKeyDown={handleKeyDown}>
			<PlainTextPlugin
				contentEditable={
					<ContentEditable className={styles.input} spellCheck={false} />
				}
				placeholder={
					<div className={styles.placeholder}>
						Start typing to create recipes…
					</div>
				}
				ErrorBoundary={LexicalErrorBoundary}
			/>
			<HistoryPlugin />
			<ParagraphBreakPlugin />
			<TextExtractionPlugin onTextChange={onTextChange} />
			<SyntaxHighlightPlugin ingredients={ingredients} />
			<IngredientTypeaheadPlugin ingredients={ingredients} />
			{ref ? <EditorHandlePlugin ref={ref} /> : null}
		</div>
	);
}

export function RecipeEditor({
	ref,
	ingredients,
	onTextChange,
}: {
	ref?: Ref<RecipeEditorHandle>;
	ingredients: Ingredient[];
	onTextChange: (text: string) => void;
}) {
	const initialConfig = {
		namespace: "RecipeEditor",
		theme: recipeEditorTheme,
		onError,
		nodes: [],
	};

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<EditorContainer
				ref={ref}
				ingredients={ingredients}
				onTextChange={onTextChange}
			/>
		</LexicalComposer>
	);
}
