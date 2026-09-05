"use client";

import { pickRandom } from "@bespoke/domain/utils/collection";
import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import {
	$createParagraphNode,
	$createTextNode,
	$getRoot,
	type LexicalEditor,
} from "lexical";
import { type ReactNode, type RefObject, useState } from "react";
import { BulkDraftInfo } from "../BulkDraftInfo";
import { Flex } from "../Flex";
import { useIsMounted } from "../hooks/useIsMounted";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { EDITOR_CONFIG, EXAMPLE_RECIPES } from "./constants";
import { RecipeIngredientsProvider } from "./hooks/useRecipeIngredients";
import { EditorActionsPlugin } from "./plugins/EditorActionsPlugin";
import { EscapeFocusPlugin } from "./plugins/EscapeFocusPlugin";
import { ParagraphBreakPlugin } from "./plugins/ParagraphBreakPlugin";
import { SyntaxHighlightPlugin } from "./plugins/SyntaxHighlightPlugin";
import { TextChangePlugin } from "./plugins/TextChangePlugin";
import {
	HistoricUpdateGuard,
	HistoricUpdateProvider,
} from "./plugins/TokenMenus/HistoricUpdateGuard";
import { IngredientTypeaheadPlugin } from "./plugins/TokenMenus/IngredientTypeaheadPlugin";
import { TokenBrowsingPlugin } from "./plugins/TokenMenus/TokenBrowsingPlugin";
import { UnitTypeaheadPlugin } from "./plugins/TokenMenus/UnitTypeaheadPlugin";
import styles from "./styles.module.css";

function seedEditorState(text: string) {
	const root = $getRoot();
	if (root.getChildrenSize() > 0) return;
	for (const line of text.split("\n")) {
		const paragraph = $createParagraphNode();
		if (line) paragraph.append($createTextNode(line));
		root.append(paragraph);
	}
}

export function RecipeEditor({
	editorRef,
	ingredients,
	onTextChange,
	statusBar,
	initialText,
}: {
	editorRef?: RefObject<LexicalEditor | null>;
	ingredients: Ingredient[];
	onTextChange: (text: string) => void;
	statusBar?: ReactNode;
	initialText?: string;
}) {
	const [config] = useState(() => ({
		...EDITOR_CONFIG,
		editorState: initialText ? () => seedEditorState(initialText) : undefined,
	}));
	const placeholder = useIsMounted(() => pickRandom(EXAMPLE_RECIPES));

	return (
		<LexicalComposer initialConfig={config}>
			<RecipeIngredientsProvider ingredients={ingredients}>
				<div className={styles.root}>
					<Flex
						gap={2}
						alignItems="center"
						justifyContent="space-between"
						className={styles.titleBar}
					>
						<Flex gap={2} alignItems="center">
							<Icon
								name="duotone-input-text"
								size={3}
								className={styles.titleIcon}
							/>

							<Text size={1} weight={600}>
								Text editor
							</Text>
						</Flex>

						<BulkDraftInfo />
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
							placeholder={
								<div className={styles.placeholder}>{placeholder}</div>
							}
							ErrorBoundary={LexicalErrorBoundary}
						/>
						<HistoryPlugin />
						<ClearEditorPlugin />
						<TextChangePlugin onTextChange={onTextChange} />
						<ParagraphBreakPlugin />
						<SyntaxHighlightPlugin />
						<HistoricUpdateProvider>
							<HistoricUpdateGuard />
							<IngredientTypeaheadPlugin />
							<UnitTypeaheadPlugin />
						</HistoricUpdateProvider>
						<TokenBrowsingPlugin />
						<EscapeFocusPlugin />
						{editorRef ? <EditorRefPlugin editorRef={editorRef} /> : null}
					</div>
					<EditorActionsPlugin />

					{statusBar ? (
						<div className={styles.statusBar}>{statusBar}</div>
					) : null}
				</div>
			</RecipeIngredientsProvider>
		</LexicalComposer>
	);
}
