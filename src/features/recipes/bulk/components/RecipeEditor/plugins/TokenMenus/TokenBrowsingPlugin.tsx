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
import { quantityTextParser } from "@/features/quantity/utils/parseQuantity";
import {
	type Token,
	tokenizeLine,
} from "@/features/recipes/bulk/utils/tokenizeLine";
import { SORTED_UNITS } from "@/features/units/constants";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { useMenuKeyboard } from "../../hooks/useMenuKeyboard";
import { useRecipeIngredients } from "../../hooks/useRecipeIngredients";
import {
	createParagraphDOMRange,
	getParagraphTextNodes,
} from "../../utils/paragraphRange";
import { IngredientMenu } from "./IngredientMenu";
import { IngredientOption } from "./IngredientOption";
import styles from "./styles.module.css";
import { UnitOption } from "./UnitOption";

/**
 * Callback ref that scrolls the attached element into the nearest scroll
 * container. Assigned to the currently highlighted option only — when
 * `selectedIndex` changes, React calls the old slot's ref with `null` and
 * the new slot's ref with the element, and that second call scrolls.
 */
const scrollIntoViewRef = (el: HTMLLIElement | null) => {
	el?.scrollIntoView({ block: "nearest" });
};

type BrowsingStateBase = {
	paragraphKey: string;
	tokenStart: number;
	tokenEnd: number;
	anchorRect: DOMRect;
	selectedIndex: number;
};

type BrowsingState =
	| (BrowsingStateBase & { variant: "ingredient" })
	| (BrowsingStateBase & { variant: "unit"; quantity: number });

/**
 * Parse the quantity associated with a unit token so the replacement label
 * can be pluralized correctly. Falls back to `1` (singular) if parsing
 * fails — the text still gets replaced, just possibly with the singular
 * form when the user had a plural quantity.
 */
function resolveUnitQuantity(tokens: Token[]): number {
	const quantityToken = tokens.find((t) => t.type === "quantity");
	if (!quantityToken) return 1;
	const [quantity] = quantityTextParser(quantityToken.text);
	return quantity ?? 1;
}

export function TokenBrowsingPlugin() {
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
					const browsable = tokens.filter(
						(t) => t.type === "ingredient" || t.type === "unit",
					);
					if (browsable.length === 0) {
						setState(null);
						return;
					}

					const textNodes = getParagraphTextNodes(paragraph);

					/**
					 * For each browsable token, measure the bounding rect of its
					 * characters via a DOM Range. Only open the menu if the click
					 * coordinates landed inside that rect — not just near it.
					 */
					for (const token of browsable) {
						const range = createParagraphDOMRange(
							editor,
							textNodes,
							token.start,
							token.end,
						);
						if (!range) continue;
						const rect = range.getBoundingClientRect();
						const inside =
							event.clientX >= rect.left &&
							event.clientX <= rect.right &&
							event.clientY >= rect.top &&
							event.clientY <= rect.bottom;
						if (!inside) continue;

						const base: BrowsingStateBase = {
							paragraphKey: paragraph.getKey(),
							tokenStart: token.start,
							tokenEnd: token.end,
							anchorRect: rect,
							selectedIndex: 0,
						};
						if (token.type === "ingredient") {
							setState({ ...base, variant: "ingredient" });
						} else {
							setState({
								...base,
								variant: "unit",
								quantity: resolveUnitQuantity(tokens),
							});
						}
						return;
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

	const commit = (replacement: string) => {
		if (!state) return;
		editor.update(() => {
			const paragraph = $getNodeByKey(state.paragraphKey);
			if (!$isParagraphNode(paragraph)) return;
			const text = paragraph.getTextContent();
			const replaced =
				text.slice(0, state.tokenStart) +
				replacement +
				text.slice(state.tokenEnd);
			for (const child of paragraph.getChildren()) child.remove();
			const newText = $createTextNode(replaced);
			paragraph.append(newText);
			const caret = state.tokenStart + replacement.length;
			newText.select(caret, caret);
		});
		setState(null);
	};

	const itemCount =
		state?.variant === "ingredient"
			? sortedIngredients.length
			: state?.variant === "unit"
				? SORTED_UNITS.length
				: 0;

	useMenuKeyboard(editor, state !== null, {
		onMove: (delta) =>
			setState((prev) =>
				prev && itemCount > 0
					? {
							...prev,
							selectedIndex:
								(prev.selectedIndex + delta + itemCount) % itemCount,
						}
					: prev,
			),
		onCommit: () => {
			if (!state) return;
			if (state.variant === "ingredient") {
				const selected = sortedIngredients[state.selectedIndex];
				if (selected) commit(selected.name);
			} else {
				const selected = SORTED_UNITS[state.selectedIndex];
				if (selected) commit(getFormattedUnit(selected, state.quantity));
			}
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
				{state.variant === "ingredient"
					? sortedIngredients.map((ingredient, index) => {
							const isHighlighted = state.selectedIndex === index;
							return (
								<IngredientOption
									key={ingredient.id}
									ref={isHighlighted ? scrollIntoViewRef : undefined}
									ingredient={ingredient}
									isHighlighted={isHighlighted}
									onClick={() => commit(ingredient.name)}
									onMouseEnter={() =>
										setState((prev) =>
											prev ? { ...prev, selectedIndex: index } : null,
										)
									}
								/>
							);
						})
					: SORTED_UNITS.map((unit, index) => {
							const isHighlighted = state.selectedIndex === index;
							return (
								<UnitOption
									key={unit}
									ref={isHighlighted ? scrollIntoViewRef : undefined}
									unit={unit}
									isHighlighted={isHighlighted}
									onClick={() => commit(getFormattedUnit(unit, state.quantity))}
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
