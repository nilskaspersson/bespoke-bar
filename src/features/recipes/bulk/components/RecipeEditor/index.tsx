"use client";
"use no memo";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import type { ReactNode, Ref } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { useIsMounted } from "@/hooks/useIsMounted";
import { Flex } from "@/ui/Flex";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
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
import { recipeEditorTheme } from "./theme";

export type { RecipeEditorHandle };

const EXAMPLE_RECIPES = [
	"Gimlet\n5 cl gin\n3 cl lime juice\n2.5 cl simple syrup",
	"Daiquiri\n2 oz rum\n1 oz lime juice\n3/4 oz simple syrup",
	"Negroni\n3 cl gin\n3 cl campari\n3 cl sweet vermouth",
	"Old Fashioned\n6 cl bourbon\n2 dashes angostura bitters\n1 barspoon simple syrup",
	"Margarita\n4 cl tequila\n2 cl lime juice\n2 cl cointreau",
	"Whiskey Sour\n6 cl bourbon\n3 cl lemon juice\n1.5 cl simple syrup",
];

function pickRandom<T>(items: T[]): T {
	return items[Math.floor(Math.random() * items.length)];
}

function onError(error: Error) {
	console.error("[RecipeEditor]", error);
}

const EDITOR_CONFIG = {
	namespace: "RecipeEditor",
	theme: recipeEditorTheme,
	onError,
	nodes: [],
};

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
						<ContentEditable className={styles.input} spellCheck={false} />
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
}: {
	ref?: Ref<RecipeEditorHandle>;
	ingredients: Ingredient[];
	onTextChange: (text: string) => void;
	statusBar?: ReactNode;
}) {
	return (
		<LexicalComposer initialConfig={EDITOR_CONFIG}>
			<EditorContainer
				ref={ref}
				ingredients={ingredients}
				onTextChange={onTextChange}
				statusBar={statusBar}
			/>
		</LexicalComposer>
	);
}
