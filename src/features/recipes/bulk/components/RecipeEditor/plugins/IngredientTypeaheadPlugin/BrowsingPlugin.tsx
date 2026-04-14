"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$createTextNode,
	$getNearestNodeFromDOMNode,
	$getNodeByKey,
	$isParagraphNode,
	$isTextNode,
	CLICK_COMMAND,
	COMMAND_PRIORITY_LOW,
} from "lexical";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Ingredient } from "@/db/schema/ingredients";
import { tokenizeLine } from "@/features/recipes/bulk/utils/tokenizeLine";
import { useMenuKeyboard } from "../../hooks/useMenuKeyboard";
import { useRecipeIngredients } from "../../hooks/useRecipeIngredients";
import {
	createParagraphDOMRange,
	getParagraphTextNodes,
} from "../../utils/paragraphRange";
import { IngredientMenu } from "./IngredientMenu";
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
	paragraphKey: string;
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
					if (!$isParagraphNode(paragraph)) {
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

					const textNodes = getParagraphTextNodes(paragraph);

					/**
					 * For each ingredient token, measure the bounding rect of its
					 * characters via a DOM Range. Only open the menu if the click
					 * coordinates landed inside that rect — not just near it.
					 */
					for (const token of ingredientTokens) {
						const range = createParagraphDOMRange(
							editor,
							textNodes,
							token.start,
							token.end,
						);
						if (!range) continue;
						const rect = range.getBoundingClientRect();
						if (
							event.clientX >= rect.left &&
							event.clientX <= rect.right &&
							event.clientY >= rect.top &&
							event.clientY <= rect.bottom
						) {
							setState({
								paragraphKey: paragraph.getKey(),
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

	const commitIngredient = (ingredient: Ingredient) => {
		if (!state) return;
		editor.update(() => {
			const paragraph = $getNodeByKey(state.paragraphKey);
			if (!$isParagraphNode(paragraph)) return;
			const text = paragraph.getTextContent();
			const replaced =
				text.slice(0, state.tokenStart) +
				ingredient.name +
				text.slice(state.tokenEnd);
			for (const child of paragraph.getChildren()) child.remove();
			const newText = $createTextNode(replaced);
			paragraph.append(newText);
			const caret = state.tokenStart + ingredient.name.length;
			newText.select(caret, caret);
		});
		setState(null);
	};

	useMenuKeyboard(editor, state !== null, {
		onMove: (delta) =>
			setState((prev) =>
				prev
					? {
							...prev,
							selectedIndex:
								(prev.selectedIndex + delta + sortedIngredients.length) %
								sortedIngredients.length,
						}
					: null,
			),
		onCommit: () => {
			if (!state) return;
			const selected = sortedIngredients[state.selectedIndex];
			if (selected) commitIngredient(selected);
		},
		onClose: () => setState(null),
	});

	if (!state) return null;

	return createPortal(
		<div
			className={styles.browsingPopover}
			style={{
				top: state.anchorRect.bottom + window.scrollY,
				left: state.anchorRect.left + window.scrollX,
			}}
		>
			<IngredientMenu footerAction="replace">
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
			</IngredientMenu>
		</div>,
		document.body,
	);
}
