"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
	$getNearestNodeFromDOMNode,
	$getNodeByKey,
	$isTextNode,
	CLICK_COMMAND,
	COMMAND_PRIORITY_HIGH,
	COMMAND_PRIORITY_LOW,
	KEY_ARROW_DOWN_COMMAND,
	KEY_ARROW_UP_COMMAND,
	KEY_ENTER_COMMAND,
	KEY_ESCAPE_COMMAND,
	KEY_TAB_COMMAND,
} from "lexical";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Ingredient } from "@/db/schema/ingredients";
import { tokenizeLine } from "@/features/recipes/bulk/utils/tokenizeLine";
import { Kbd } from "@/ui/Kbd";
import { OptionsList } from "@/ui/OptionsList";
import { Text as UIText } from "@/ui/Text";
import { useRecipeIngredients } from "../../hooks/useRecipeIngredients";
import { IngredientOption } from "./IngredientOption";
import styles from "./styles.module.css";

/**
 * Callback ref that scrolls the attached element into the nearest scroll
 * container. Assigned to the currently highlighted `IngredientOption` only —
 * when `selectedIndex` changes, React calls the old slot's ref with `null`
 * and the new slot's ref with the element, and that second call scrolls.
 */
const scrollIntoViewRef = (el: HTMLLIElement | null) => {
	el?.scrollIntoView({ block: "nearest" });
};

type BrowsingState = {
	nodeKey: string;
	tokenStart: number;
	tokenEnd: number;
	anchorRect: DOMRect;
	selectedIndex: number;
};

export function IngredientBrowsingPlugin() {
	const [editor] = useLexicalComposerContext();
	const [state, setState] = useState<BrowsingState | null>(null);
	const { sortedIngredients, ingredientIndex } = useRecipeIngredients();

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

					/**
					 * Tokenize the clicked TextNode's own text, not the paragraph's
					 * full content. A paragraph may hold multiple logical lines
					 * (paste-shape: `TextNode`s separated by `LineBreakNode`s), so
					 * paragraph-relative token offsets don't map back onto the
					 * clicked text node's DOM range. Treating the clicked node as
					 * its own line keeps offsets local and matches how every
					 * ingredient line is laid out in practice.
					 */
					const lineText = lexNode.getTextContent();
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
					const textLength = textDomNode.length;

					/**
					 * For each ingredient token, measure the bounding rect of its
					 * characters via a DOM Range. Only open the menu if the click
					 * coordinates landed inside that rect — not just near it.
					 */
					for (const token of ingredientTokens) {
						if (token.start < 0 || token.end > textLength) continue;
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
	 * Close the menu on any text mutation (typing, deleting). Lexical reports
	 * text changes via `dirtyLeaves` — selection-only updates leave it empty,
	 * so we don't race with the click-to-open command that has just moved the
	 * cursor.
	 */
	useEffect(() => {
		return editor.registerUpdateListener(({ dirtyLeaves }) => {
			if (dirtyLeaves.size > 0) setState(null);
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
			editor.registerCommand(
				KEY_TAB_COMMAND,
				(event) => {
					event.preventDefault();
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
				footer={
					<UIText size={1} className={styles.footer}>
						<Kbd shortcut="tab" visual variant="ghost" /> or{" "}
						<Kbd shortcut="enter" visual variant="ghost" /> to complete
					</UIText>
				}
			>
				{sortedIngredients.map((ingredient, index) => {
					const isHighlighted = state.selectedIndex === index;
					return (
						<IngredientOption
							key={ingredient.id}
							ref={isHighlighted ? scrollIntoViewRef : undefined}
							ingredient={ingredient}
							isHighlighted={isHighlighted}
							onClick={() => commitIngredient(ingredient)}
							onMouseEnter={() =>
								setState((prev) =>
									prev ? { ...prev, selectedIndex: index } : null,
								)
							}
						/>
					);
				})}
			</OptionsList>
		</div>,
		document.body,
	);
}
