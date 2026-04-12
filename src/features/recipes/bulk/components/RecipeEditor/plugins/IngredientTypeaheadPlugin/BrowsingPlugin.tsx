"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
	$getNearestNodeFromDOMNode,
	$getNodeByKey,
	$getRoot,
	$isTextNode,
	CLICK_COMMAND,
	COMMAND_PRIORITY_HIGH,
	COMMAND_PRIORITY_LOW,
	KEY_ARROW_DOWN_COMMAND,
	KEY_ARROW_UP_COMMAND,
	KEY_ENTER_COMMAND,
	KEY_ESCAPE_COMMAND,
} from "lexical";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Ingredient } from "@/db/schema/ingredients";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { buildIngredientIndex } from "@/features/ingredients/utils/buildIngredientIndex";
import { tokenizeLine } from "@/features/recipes/bulk/utils/tokenizeLine";
import { OptionsList } from "@/ui/OptionsList";
import { collator } from "@/utils/collator";
import styles from "./styles.module.css";
import { formatAbv } from "./utils";

type BrowsingState = {
	nodeKey: string;
	tokenStart: number;
	tokenEnd: number;
	anchorRect: DOMRect;
	selectedIndex: number;
};

export function IngredientBrowsingPlugin({
	ingredients,
}: {
	ingredients: Ingredient[];
}) {
	const [editor] = useLexicalComposerContext();
	const [state, setState] = useState<BrowsingState | null>(null);

	const sortedIngredients = useMemo(
		() => [...ingredients].sort((a, b) => collator.compare(a.name, b.name)),
		[ingredients],
	);

	const ingredientIndex = useMemo(
		() => buildIngredientIndex(ingredients),
		[ingredients],
	);

	useEffect(() => {
		return editor.registerCommand(
			CLICK_COMMAND,
			(event: MouseEvent) => {
				editor.read(() => {
					/**
					 * Resolve the Lexical TextNode under the click target by walking
					 * up from the clicked DOM element. This is independent of where
					 * Lexical moves the selection, so it does not misfire when a click
					 * lands past the end of a line and only shifts the cursor.
					 */
					const target = event.target;
					if (!(target instanceof Node)) {
						setState(null);
						return;
					}
					const lexNode = $getNearestNodeFromDOMNode(target);
					if (!$isTextNode(lexNode)) {
						setState(null);
						return;
					}
					const paragraph = lexNode.getParent();
					if (!paragraph) {
						setState(null);
						return;
					}
					const lineText = paragraph.getTextContent();
					const { tokens } = tokenizeLine(lineText, ingredientIndex);
					const ingredientTokens = tokens.filter(
						(t) => t.type === "ingredient",
					);
					if (ingredientTokens.length === 0) {
						setState(null);
						return;
					}

					const dom = editor.getElementByKey(lexNode.getKey());
					const textDomNode = dom?.firstChild;
					if (!(textDomNode instanceof Text)) {
						setState(null);
						return;
					}

					/**
					 * For each ingredient token, measure the bounding rect of its
					 * characters via a DOM Range. Only open the menu if the click
					 * coordinates landed inside that rect — not just near it.
					 */
					for (const token of ingredientTokens) {
						const range = document.createRange();
						range.setStart(textDomNode, token.start);
						range.setEnd(textDomNode, token.end);
						const rect = range.getBoundingClientRect();
						if (
							event.clientX >= rect.left &&
							event.clientX <= rect.right &&
							event.clientY >= rect.top &&
							event.clientY <= rect.bottom
						) {
							setState({
								nodeKey: lexNode.getKey(),
								tokenStart: token.start,
								tokenEnd: token.end,
								anchorRect: rect,
								selectedIndex: 0,
							});
							return;
						}
					}
					setState(null);
				});
				return false;
			},
			COMMAND_PRIORITY_LOW,
		);
	}, [editor, ingredientIndex]);

	/**
	 * Close the menu when the editor's text content changes (typing, deleting).
	 * Selection-only updates do not close it — otherwise the click-to-open
	 * command and the update listener race on which runs first.
	 */
	useEffect(() => {
		let prevText = editor
			.getEditorState()
			.read(() => $getRoot().getTextContent());
		return editor.registerUpdateListener(({ editorState }) => {
			const text = editorState.read(() => $getRoot().getTextContent());
			if (text !== prevText) {
				prevText = text;
				setState(null);
			}
		});
	}, [editor]);

	const commitIngredient = useCallback(
		(ingredient: Ingredient) => {
			if (!state) return;
			editor.update(() => {
				const node = $getNodeByKey(state.nodeKey);
				if (!$isTextNode(node)) return;
				const text = node.getTextContent();
				const before = text.slice(0, state.tokenStart);
				const after = text.slice(state.tokenEnd);
				const replaced = before + ingredient.name + after;
				node.setTextContent(replaced);
				const caret = before.length + ingredient.name.length;
				node.select(caret, caret);
			});
			setState(null);
		},
		[editor, state],
	);

	const isOpen = state !== null;

	useEffect(() => {
		if (!isOpen) return;
		return mergeRegister(
			editor.registerCommand(
				KEY_ESCAPE_COMMAND,
				(event) => {
					event.preventDefault();
					setState(null);
					return true;
				},
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerCommand(
				KEY_ARROW_DOWN_COMMAND,
				(event) => {
					event.preventDefault();
					setState((prev) =>
						prev
							? {
									...prev,
									selectedIndex:
										(prev.selectedIndex + 1) % sortedIngredients.length,
								}
							: null,
					);
					return true;
				},
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerCommand(
				KEY_ARROW_UP_COMMAND,
				(event) => {
					event.preventDefault();
					setState((prev) =>
						prev
							? {
									...prev,
									selectedIndex:
										(prev.selectedIndex - 1 + sortedIngredients.length) %
										sortedIngredients.length,
								}
							: null,
					);
					return true;
				},
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerCommand(
				KEY_ENTER_COMMAND,
				(event) => {
					event?.preventDefault();
					const selected = sortedIngredients[state?.selectedIndex ?? 0];
					if (selected) commitIngredient(selected);
					return true;
				},
				COMMAND_PRIORITY_HIGH,
			),
		);
	}, [
		editor,
		isOpen,
		sortedIngredients,
		state?.selectedIndex,
		commitIngredient,
	]);

	if (!state) return null;

	return createPortal(
		<div
			className={styles.browsingPopover}
			style={{
				top: state.anchorRect.bottom + window.scrollY,
				left: state.anchorRect.left + window.scrollX,
			}}
		>
			<OptionsList
				className={styles.typeahead}
				onMouseDown={(e) => e.preventDefault()}
			>
				{sortedIngredients.map((ingredient, index) => {
					const category = ingredient.category
						? CATEGORY_TO_LABEL.get(ingredient.category)
						: null;
					const abv = formatAbv(ingredient.abv);
					return (
						<OptionsList.Item
							key={ingredient.id}
							isHighlighted={state.selectedIndex === index}
							onClick={() => commitIngredient(ingredient)}
							onMouseEnter={() =>
								setState((prev) =>
									prev ? { ...prev, selectedIndex: index } : null,
								)
							}
						>
							<OptionsList.Label
								description={
									[category, abv].filter(Boolean).join(", ") || undefined
								}
							>
								{ingredient.name}
							</OptionsList.Label>
						</OptionsList.Item>
					);
				})}
			</OptionsList>
		</div>,
		document.body,
	);
}
