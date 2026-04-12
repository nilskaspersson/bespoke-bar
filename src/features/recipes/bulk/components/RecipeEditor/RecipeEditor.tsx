"use client";
"use no memo";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { type ReactNode, type Ref, useState } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { useIsMounted } from "@/hooks/useIsMounted";
import { Flex } from "@/ui/Flex";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import { pickRandom } from "@/utils";
import { EDITOR_CONFIG, EXAMPLE_RECIPES } from "./constants";
import { EditorActionsPlugin } from "./plugins/EditorActionsPlugin";
import {
	EditorHandlePlugin,
	type RecipeEditorHandle,
} from "./plugins/EditorHandlePlugin";
import { IngredientTypeaheadPlugin } from "./plugins/IngredientTypeaheadPlugin";
import { ParagraphBreakPlugin } from "./plugins/ParagraphBreakPlugin";
import { SyntaxHighlightPlugin } from "./plugins/SyntaxHighlightPlugin";
import { TextExtractionPlugin } from "./plugins/TextExtractionPlugin";
import styles from "./RecipeEditor.module.css";

export type { RecipeEditorHandle };

function seedEditorState(text: string) {
	const root = $getRoot();
	if (root.getChildrenSize() > 0) return;
	for (const line of text.split("\n")) {
		const paragraph = $createParagraphNode();
		if (line) paragraph.append($createTextNode(line));
		root.append(paragraph);
	}
}

function EditorContainer({
	ref,
	ingredients,
	onTextChange,
	statusBar,
}: {
	ref?: Ref<RecipeEditorHandle>;
	ingredients: Ingredient[];
	onTextChange: (text: string) => void;
	statusBar?: ReactNode;
}) {
	const placeholder = useIsMounted(() => pickRandom(EXAMPLE_RECIPES));

	return (
		<div className={styles.root}>
			<Flex gap={2} alignItems="center" className={styles.titleBar}>
				<Icon name="duotone-input-text" size={3} className={styles.titleIcon} />

				<Text size={1} weight={600}>
					Recipe editor
				</Text>
			</Flex>

			<div className={styles.container}>
				<PlainTextPlugin
					contentEditable={
						<ContentEditable
							className={styles.input}
							spellCheck={false}
							autoComplete="off"
							autoCorrect="off"
						/>
					}
					placeholder={<div className={styles.placeholder}>{placeholder}</div>}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<HistoryPlugin />
				<ParagraphBreakPlugin />
				<TextExtractionPlugin onTextChange={onTextChange} />
				<SyntaxHighlightPlugin ingredients={ingredients} />
				<IngredientTypeaheadPlugin ingredients={ingredients} />
				{ref ? <EditorHandlePlugin ref={ref} /> : null}
			</div>
			<EditorActionsPlugin />

			{statusBar ? <div className={styles.statusBar}>{statusBar}</div> : null}
		</div>
	);
}

export function RecipeEditor({
	ref,
	ingredients,
	onTextChange,
	statusBar,
	initialText,
}: {
	ref?: Ref<RecipeEditorHandle>;
	ingredients: Ingredient[];
	onTextChange: (text: string) => void;
	statusBar?: ReactNode;
	initialText?: string;
}) {
	const [config] = useState(() => ({
		...EDITOR_CONFIG,
		editorState: initialText ? () => seedEditorState(initialText) : undefined,
	}));

	return (
		<LexicalComposer initialConfig={config}>
			<EditorContainer
				ref={ref}
				ingredients={ingredients}
				onTextChange={onTextChange}
				statusBar={statusBar}
			/>
		</LexicalComposer>
	);
}
