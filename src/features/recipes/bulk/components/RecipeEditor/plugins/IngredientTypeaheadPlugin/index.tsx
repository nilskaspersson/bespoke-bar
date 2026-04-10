"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getRoot,
	$getSelection,
	$isLineBreakNode,
	$isRangeSelection,
	$isTextNode,
	type LexicalEditor,
} from "lexical";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { quantityTextParser } from "@/features/quantity/utils/parseQuantity";
import { getGhostCompletion } from "@/features/recipes/bulk/utils/getGhostCompletion";
import { unitTextParser } from "@/features/units/utils/parseUnit";
import { Kbd } from "@/ui/Kbd";
import { OptionItem } from "@/ui/OptionItem";
import { OptionLabel } from "@/ui/OptionLabel";
import { OptionsList } from "@/ui/OptionsList";
import { Text } from "@/ui/Text";
import { normalizeInput } from "@/utils";
import { collator } from "@/utils/collator";
import { createSearchIndex, searchByIndex } from "@/utils/search";
import { useEditorFocus } from "../../hooks/useEditorFocus";
import { useGhostText } from "../../hooks/useGhostText";
import { useTypeaheadAnchor } from "../../hooks/useTypeaheadAnchor";
import { useTypeaheadKeyboard } from "../../hooks/useTypeaheadKeyboard";
import styles from "./styles.module.css";

// ─── Types ──────────────────────────────────────────────────

type MenuMode = "typing" | "browsing";

type MenuState = {
	mode: MenuMode;
	queryString: string;
};

type IngredientOption = {
	key: string;
	ingredient: Ingredient;
};

// ─── Helpers ────────────────────────────────────────────────

function formatAbv(abv: number | null): string | null {
	if (abv === null) return null;
	return `${(abv * 100).toFixed(0)}%`;
}

function preventFocusLoss(e: React.MouseEvent) {
	e.preventDefault();
}

/**
 * Read the current line from the Lexical selection and extract the
 * ingredient query (text after quantity + unit, up to the cursor).
 * Must be called inside `editor.getEditorState().read()`.
 */
function getIngredientQuery(): {
	matchingString: string;
	cursorAtEnd: boolean;
} | null {
	const selection = $getSelection();
	if (!$isRangeSelection(selection) || !selection.isCollapsed()) return null;

	const anchor = selection.anchor;
	if (anchor.type !== "text") return null;

	const anchorNode = anchor.getNode();
	const paragraph = anchorNode.getParent();
	if (!paragraph) return null;

	let lineText = "";
	let cursorOffset = 0;
	let foundAnchor = false;

	for (const child of paragraph.getChildren()) {
		if ($isLineBreakNode(child)) {
			if (foundAnchor) break;
			lineText = "";
			continue;
		}
		const text = child.getTextContent();
		if (child.is(anchorNode)) {
			cursorOffset = lineText.length + anchor.offset;
			foundAnchor = true;
		}
		lineText += text;
	}

	if (!foundAnchor) return null;

	const textUpToCursor = lineText.slice(0, cursorOffset);
	const [quantity, quantityRemainder] = quantityTextParser(textUpToCursor);
	if (quantity === null) return null;

	const [unit, unitRemainder] = unitTextParser(quantityRemainder.trimStart());
	if (unit === null) return null;

	const ingredientText = unitRemainder.trimStart();
	if (ingredientText.length === 0) return null;

	const restOfLine = lineText.slice(cursorOffset).trimEnd();
	return {
		matchingString: ingredientText,
		cursorAtEnd: restOfLine.length === 0,
	};
}

function replaceIngredientText(
	editor: LexicalEditor,
	matchingString: string,
	replacement: string,
) {
	editor.update(() => {
		const selection = $getSelection();
		if (!$isRangeSelection(selection) || !selection.isCollapsed()) return;

		const anchor = selection.anchor;
		if (anchor.type !== "text") return;

		const textNode = anchor.getNode();
		const text = textNode.getTextContent();
		const matchStart = text.lastIndexOf(matchingString);
		if (matchStart < 0) return;

		const before = text.slice(0, matchStart);
		textNode.setTextContent(before + replacement);

		let sibling = textNode.getNextSibling();
		while (sibling && $isTextNode(sibling)) {
			const next = sibling.getNextSibling();
			sibling.remove();
			sibling = next;
		}

		const offset = before.length + replacement.length;
		selection.anchor.set(textNode.__key, offset, "text");
		selection.focus.set(textNode.__key, offset, "text");
	});
}

// ─── Component ──────────────────────────────────────────────

export function IngredientTypeaheadPlugin({
	ingredients,
}: {
	ingredients: Ingredient[];
}) {
	const [editor] = useLexicalComposerContext();
	const [menuState, setMenuState] = useState<MenuState | null>(null);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const prevTextRef = useRef("");
	const menuStateRef = useRef(menuState);
	menuStateRef.current = menuState;

	const queryString = menuState?.queryString ?? null;
	const menuMode = menuState?.mode ?? null;
	const queryStringRef = useRef(queryString);
	queryStringRef.current = queryString;

	// ── Ingredient index ────────────────────────────────────

	const sortedIngredients = useMemo(
		() => [...ingredients].sort((a, b) => collator.compare(a.name, b.name)),
		[ingredients],
	);

	const ingredientIndex = useMemo(
		() =>
			createSearchIndex(
				sortedIngredients,
				(i) => i.id,
				(i) => {
					const fields = [i.name];
					const categoryLabel = i.category
						? CATEGORY_TO_LABEL.get(i.category)
						: null;
					if (categoryLabel) fields.push(categoryLabel);
					return fields;
				},
			),
		[sortedIngredients],
	);

	const ingredientNamesNormalized = useMemo(
		() => new Set(sortedIngredients.map((i) => normalizeInput(i.name))),
		[sortedIngredients],
	);

	// ── Menu state ──────────────────────────────────────────

	const openMenu = useCallback((mode: MenuMode, qs: string) => {
		const prev = menuStateRef.current;
		if (prev?.mode === mode && prev?.queryString === qs) return;
		setMenuState({ mode, queryString: qs });
		setSelectedIndex(null);
	}, []);

	const forceClose = useCallback(() => setMenuState(null), []);

	const closeMenu = useCallback(() => {
		if (!menuStateRef.current) return;
		setMenuState(null);
	}, []);

	// ── Editor interactions ─────────────────────────────────

	const { mouseDownRef, escapeRef } = useEditorFocus(menuStateRef, forceClose);

	// ── Menu detection ──────────────────────────────────────

	useEffect(() => {
		return editor.registerUpdateListener(() => {
			editor.getEditorState().read(() => {
				const currentText = $getRoot().getTextContent();
				const textChanged = currentText !== prevTextRef.current;
				prevTextRef.current = currentText;

				if (textChanged) escapeRef.current = false;
				if (escapeRef.current) {
					closeMenu();
					return;
				}

				const result = getIngredientQuery();
				if (!result) {
					closeMenu();
					return;
				}

				let mode: MenuMode | null = null;

				if (textChanged) {
					if (!result.cursorAtEnd) {
						closeMenu();
						return;
					}
					if (
						ingredientNamesNormalized.has(normalizeInput(result.matchingString))
					) {
						closeMenu();
						return;
					}
					mode = "typing";
				} else if (mouseDownRef.current) {
					mode = "browsing";
				}

				if (!mode) {
					closeMenu();
					return;
				}

				openMenu(mode, result.matchingString);
			});
		});
	}, [
		editor,
		ingredientNamesNormalized,
		openMenu,
		closeMenu,
		escapeRef,
		mouseDownRef,
	]);

	// ── Options & ghost text ────────────────────────────────

	const options = useMemo(() => {
		if (!queryString || !menuMode) return [];

		if (menuMode === "browsing") {
			return sortedIngredients.map((i) => ({ key: i.id, ingredient: i }));
		}

		return searchByIndex(
			sortedIngredients,
			ingredientIndex,
			(i) => i.id,
			queryString,
		)
			.slice(0, 10)
			.map((i) => ({ key: i.id, ingredient: i }));
	}, [sortedIngredients, ingredientIndex, queryString, menuMode]);

	const ghostText = useMemo(() => {
		if (!queryString || menuMode !== "typing" || options.length === 0)
			return null;
		const active = options[selectedIndex ?? 0];
		if (!active) return null;
		return getGhostCompletion(queryString, active.ingredient.name);
	}, [queryString, menuMode, options, selectedIndex]);

	useGhostText(ghostText);
	useTypeaheadAnchor("--typeahead", menuState);

	// ── Selection ───────────────────────────────────────────

	const selectOption = useCallback(
		(option: IngredientOption) => {
			const matching = queryStringRef.current;
			if (!matching) return;
			replaceIngredientText(editor, matching, option.ingredient.name);
			closeMenu();
		},
		[editor, closeMenu],
	);

	const scrollIntoView = useCallback((el: HTMLLIElement | null) => {
		el?.scrollIntoView({ behavior: "instant", block: "nearest" });
	}, []);

	const hasMenu = menuState !== null && options.length > 0;

	useTypeaheadKeyboard(
		hasMenu,
		options,
		selectedIndex,
		setSelectedIndex,
		() => {
			escapeRef.current = true;
			closeMenu();
		},
		selectOption,
	);

	// ── Render ──────────────────────────────────────────────

	if (!menuState || options.length === 0) return null;

	return (
		<OptionsList
			className={styles.typeahead}
			onMouseDown={preventFocusLoss}
			footer={
				<Text size={1} className={styles.footer}>
					<Kbd shortcut="tab" visual variant="ghost" />{" "}
					{selectedIndex !== null && (
						<>
							or <Kbd shortcut="enter" visual variant="ghost" />
						</>
					)}{" "}
					to complete
				</Text>
			}
		>
			{options.map((option, index) => {
				const { ingredient } = option;
				const category = ingredient.category
					? CATEGORY_TO_LABEL.get(ingredient.category)
					: null;
				const abv = formatAbv(ingredient.abv);

				return (
					<OptionItem
						key={option.key}
						ref={selectedIndex === index ? scrollIntoView : undefined}
						isHighlighted={selectedIndex === index}
						onClick={() => selectOption(option)}
						onMouseEnter={() => setSelectedIndex(index)}
					>
						<OptionLabel
							description={
								[category, abv].filter(Boolean).join(", ") || undefined
							}
						>
							{ingredient.name}
						</OptionLabel>
					</OptionItem>
				);
			})}
		</OptionsList>
	);
}
