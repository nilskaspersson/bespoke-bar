"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getRoot,
	$getSelection,
	$isLineBreakNode,
	$isRangeSelection,
	$isTextNode,
	COMMAND_PRIORITY_HIGH,
	KEY_ARROW_DOWN_COMMAND,
	KEY_ARROW_UP_COMMAND,
	KEY_ENTER_COMMAND,
	KEY_ESCAPE_COMMAND,
	KEY_TAB_COMMAND,
	type LexicalEditor,
	mergeRegister,
} from "lexical";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
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
import { createSearchIndex, searchByIndex } from "@/utils/search";
import styles from "../RecipeEditor.module.css";
import { useGhostText } from "./useGhostText";

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

// ─── Pure helpers ───────────────────────────────────────────

function formatAbv(abv: number | null): string | null {
	if (abv === null) return null;
	return `${(abv * 100).toFixed(0)}%`;
}

function preventFocusLoss(e: React.MouseEvent) {
	e.preventDefault();
}

// ─── Lexical helpers ────────────────────────────────────────

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

/**
 * Replace the ingredient text at the cursor with `replacement`,
 * removing any trailing text nodes split by Lexical.
 */
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
	const mouseDownRef = useRef(false);
	const escapeRef = useRef(false);
	const escapePendingRef = useRef(false);
	const menuStateRef = useRef(menuState);
	menuStateRef.current = menuState;

	const queryString = menuState?.queryString ?? null;
	const menuMode = menuState?.mode ?? null;
	const queryStringRef = useRef(queryString);
	queryStringRef.current = queryString;

	const ingredientIndex = useMemo(
		() =>
			createSearchIndex(
				ingredients,
				(i) => i.id,
				(i) => [i.name],
			),
		[ingredients],
	);

	const ingredientNamesNormalized = useMemo(
		() => new Set(ingredients.map((i) => normalizeInput(i.name))),
		[ingredients],
	);

	const openMenu = useCallback((mode: MenuMode, qs: string) => {
		const prev = menuStateRef.current;
		if (prev?.mode === mode && prev?.queryString === qs) return;
		setMenuState({ mode, queryString: qs });
		setSelectedIndex(null);
	}, []);

	const closeMenu = useCallback(() => {
		if (!menuStateRef.current) return;
		setMenuState(null);
	}, []);

	// ── Focus, blur & escape tracking ───────────────────────

	useEffect(() => {
		function onMouseDown(e: MouseEvent) {
			escapeRef.current = false;
			if (editor.getRootElement()?.contains(e.target as Node)) {
				mouseDownRef.current = true;
			}
		}
		function onMouseUp() {
			if (mouseDownRef.current) {
				requestAnimationFrame(() => {
					mouseDownRef.current = false;
				});
			}
		}
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") escapePendingRef.current = true;
		}
		function onKeyUp() {
			escapePendingRef.current = false;
		}
		function onBlur() {
			if (menuStateRef.current) {
				if (mouseDownRef.current) {
					setMenuState(null);
					return;
				}
				escapeRef.current = true;
				setMenuState(null);
				requestAnimationFrame(() => editor.getRootElement()?.focus());
				return;
			}
			if (escapePendingRef.current) {
				escapePendingRef.current = false;
				requestAnimationFrame(() => editor.getRootElement()?.focus());
			}
		}

		document.addEventListener("mousedown", onMouseDown, true);
		document.addEventListener("mouseup", onMouseUp, true);
		document.addEventListener("keydown", onKeyDown, true);
		document.addEventListener("keyup", onKeyUp, true);
		const removeRootListener = editor.registerRootListener((root, prev) => {
			prev?.removeEventListener("blur", onBlur);
			root?.addEventListener("blur", onBlur);
		});

		return () => {
			document.removeEventListener("mousedown", onMouseDown, true);
			document.removeEventListener("mouseup", onMouseUp, true);
			document.removeEventListener("keydown", onKeyDown, true);
			document.removeEventListener("keyup", onKeyUp, true);
			removeRootListener();
		};
	}, [editor]);

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
	}, [editor, ingredientNamesNormalized, openMenu, closeMenu]);

	// ── Options & ghost text ────────────────────────────────

	const options = useMemo(() => {
		if (!queryString || !menuMode) return [];

		if (menuMode === "browsing") {
			return ingredients.map((i) => ({ key: i.id, ingredient: i }));
		}

		return searchByIndex(ingredients, ingredientIndex, (i) => i.id, queryString)
			.slice(0, 10)
			.map((i) => ({ key: i.id, ingredient: i }));
	}, [ingredients, ingredientIndex, queryString, menuMode]);

	const ghostText = useMemo(() => {
		if (!queryString || menuMode !== "typing" || options.length === 0)
			return null;
		const active = options[selectedIndex ?? 0];
		if (!active) return null;
		return getGhostCompletion(queryString, active.ingredient.name);
	}, [queryString, menuMode, options, selectedIndex]);

	useGhostText(ghostText);

	// ── Anchor positioning ──────────────────────────────────

	const anchorDomRef = useRef<HTMLElement | null>(null);

	useLayoutEffect(() => {
		if (anchorDomRef.current) {
			anchorDomRef.current.style.anchorName = "";
			anchorDomRef.current = null;
		}

		if (!menuState) return;

		editor.getEditorState().read(() => {
			const selection = $getSelection();
			if (!$isRangeSelection(selection) || !selection.isCollapsed()) return;
			const anchor = selection.anchor;
			if (anchor.type !== "text") return;
			const node = anchor.getNode();
			const dom = editor.getElementByKey(node.getKey());
			if (dom) {
				dom.style.anchorName = "--typeahead";
				anchorDomRef.current = dom;
			}
		});

		return () => {
			if (anchorDomRef.current) {
				anchorDomRef.current.style.anchorName = "";
				anchorDomRef.current = null;
			}
		};
	}, [editor, menuState]);

	// ── Option selection ────────────────────────────────────

	const selectOption = useCallback(
		(option: IngredientOption) => {
			const matching = queryStringRef.current;
			if (!matching) return;
			replaceIngredientText(editor, matching, option.ingredient.name);
			closeMenu();
		},
		[editor, closeMenu],
	);

	// ── Keyboard navigation ─────────────────────────────────

	const selectedIndexRef = useRef(selectedIndex);
	selectedIndexRef.current = selectedIndex;
	const optionsRef = useRef(options);
	optionsRef.current = options;
	const selectOptionRef = useRef(selectOption);
	selectOptionRef.current = selectOption;

	const hasMenu = menuState !== null && options.length > 0;

	useEffect(() => {
		if (!hasMenu) return;

		return mergeRegister(
			editor.registerCommand(
				KEY_ESCAPE_COMMAND,
				(event) => {
					event.preventDefault();
					escapeRef.current = true;
					closeMenu();
					return true;
				},
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerCommand(
				KEY_ARROW_DOWN_COMMAND,
				(event) => {
					event.preventDefault();
					setSelectedIndex((prev) => {
						const len = optionsRef.current.length;
						return prev === null ? 0 : prev < len - 1 ? prev + 1 : 0;
					});
					return true;
				},
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerCommand(
				KEY_ARROW_UP_COMMAND,
				(event) => {
					event.preventDefault();
					setSelectedIndex((prev) => {
						const len = optionsRef.current.length;
						return prev === null ? len - 1 : prev > 0 ? prev - 1 : len - 1;
					});
					return true;
				},
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerCommand(
				KEY_TAB_COMMAND,
				(event) => {
					event.preventDefault();
					selectOptionRef.current(
						optionsRef.current[selectedIndexRef.current ?? 0],
					);
					return true;
				},
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerCommand(
				KEY_ENTER_COMMAND,
				(event) => {
					const idx = selectedIndexRef.current;
					if (idx === null) return false;
					event?.preventDefault();
					selectOptionRef.current(optionsRef.current[idx]);
					return true;
				},
				COMMAND_PRIORITY_HIGH,
			),
		);
	}, [editor, hasMenu, closeMenu]);

	// ── Render ──────────────────────────────────────────────

	if (!menuState || options.length === 0) return null;

	return (
		<OptionsList
			className={styles.typeahead}
			onMouseDown={preventFocusLoss}
			footer={
				<Text size={1} className={styles.typeaheadFooter}>
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
