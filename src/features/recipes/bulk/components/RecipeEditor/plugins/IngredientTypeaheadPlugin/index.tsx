"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { getGhostCompletion } from "@/features/recipes/bulk/utils/getGhostCompletion";
import { Kbd } from "@/ui/Kbd";
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
import {
	formatAbv,
	getIngredientQuery,
	type IngredientOption,
	MAX_TYPEAHEAD_OPTIONS,
	type MenuMode,
	type MenuState,
	preventFocusLoss,
	replaceIngredientText,
} from "./utils";

const getIngredientId = (i: Ingredient) => i.id;

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

	const sortedIngredients = useMemo(
		() => [...ingredients].sort((a, b) => collator.compare(a.name, b.name)),
		[ingredients],
	);

	const ingredientIndex = useMemo(
		() =>
			createSearchIndex(sortedIngredients, getIngredientId, (i) => {
				const fields = [i.name];
				const categoryLabel = i.category
					? CATEGORY_TO_LABEL.get(i.category)
					: null;
				if (categoryLabel) fields.push(categoryLabel);
				return fields;
			}),
		[sortedIngredients],
	);

	const ingredientNamesNormalized = useMemo(
		() => new Set(sortedIngredients.map((i) => normalizeInput(i.name))),
		[sortedIngredients],
	);

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

	const { mouseDownRef, escapeRef } = useEditorFocus(menuStateRef, forceClose);

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

				if (!textChanged && !mouseDownRef.current) {
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

	const options = useMemo(() => {
		if (!queryString || !menuMode) return [];

		if (menuMode === "browsing") {
			return sortedIngredients.map((i) => ({ key: i.id, ingredient: i }));
		}

		return searchByIndex(
			sortedIngredients,
			ingredientIndex,
			getIngredientId,
			queryString,
		)
			.slice(0, MAX_TYPEAHEAD_OPTIONS)
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

	const selectOption = useCallback(
		(option: IngredientOption) => {
			const matching = queryStringRef.current;
			if (!matching) return;
			replaceIngredientText(editor, matching, option.ingredient.name);
			closeMenu();
		},
		[editor, closeMenu],
	);

	const selectedItemRef = useRef<HTMLLIElement>(null);

	useEffect(() => {
		if (selectedIndex === null) return;
		selectedItemRef.current?.scrollIntoView({
			behavior: "instant",
			block: "nearest",
		});
	}, [selectedIndex]);

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
					<OptionsList.Item
						key={option.key}
						ref={selectedIndex === index ? selectedItemRef : undefined}
						isHighlighted={selectedIndex === index}
						onClick={() => selectOption(option)}
						onMouseEnter={() => setSelectedIndex(index)}
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
	);
}
