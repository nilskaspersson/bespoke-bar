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
import { createPortal } from "react-dom";
import type { Ingredient } from "@/db/schema/ingredients";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { quantityTextParser } from "@/features/quantity/utils/parseQuantity";
import { getGhostCompletion } from "@/features/recipes/bulk/utils/getGhostCompletion";
import { unitTextParser } from "@/features/units/utils/parseUnit";
import { Kbd } from "@/ui/Kbd";
import { OptionItem } from "@/ui/OptionItem";
import { OptionLabel } from "@/ui/OptionLabel";
import { OptionsList } from "@/ui/OptionsList";

type IngredientQueryResult = {
	matchingString: string;
	cursorAtEnd: boolean;
};

function getIngredientQuery(): IngredientQueryResult | null {
	const selection = $getSelection();

	if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
		return null;
	}

	const anchor = selection.anchor;

	if (anchor.type !== "text") {
		return null;
	}

	const anchorNode = anchor.getNode();
	const paragraph = anchorNode.getParent();

	if (!paragraph) {
		return null;
	}

	const children = paragraph.getChildren();
	let lineText = "";
	let cursorOffset = 0;
	let foundAnchor = false;

	for (const child of children) {
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

	if (!foundAnchor) {
		return null;
	}

	const textUpToCursor = lineText.slice(0, cursorOffset);

	const [quantity, quantityRemainder] = quantityTextParser(textUpToCursor);

	if (quantity === null) {
		return null;
	}

	const trimmedForUnit = quantityRemainder.trimStart();
	const [unit, unitRemainder] = unitTextParser(trimmedForUnit);

	if (unit === null) {
		return null;
	}

	const ingredientText = unitRemainder.trimStart();

	if (ingredientText.length === 0) {
		return null;
	}

	const restOfLine = lineText.slice(cursorOffset).trimEnd();

	return {
		matchingString: ingredientText,
		cursorAtEnd: restOfLine.length === 0,
	};
}

function formatAbv(abv: number | null): string | null {
	if (abv === null) return null;
	return `${(abv * 100).toFixed(0)}%`;
}

function preventFocusLoss(e: React.MouseEvent) {
	e.preventDefault();
}

/**
 * Get fixed-position coordinates for the menu, measured from
 * the cursor's text node so it works in all browsers.
 */
function getMenuPosition(): { top: number; left: number } | null {
	const sel = window.getSelection();
	if (!sel || sel.rangeCount === 0) return null;

	const { anchorNode, anchorOffset } = sel;
	if (!anchorNode || anchorNode.nodeType !== Node.TEXT_NODE) return null;

	const range = document.createRange();
	try {
		if (anchorOffset > 0) {
			range.setStart(anchorNode, anchorOffset - 1);
			range.setEnd(anchorNode, anchorOffset);
		} else if ((anchorNode as Text).length > 0) {
			range.setStart(anchorNode, 0);
			range.setEnd(anchorNode, 1);
		} else {
			return null;
		}
	} catch {
		return null;
	}

	const rect = range.getBoundingClientRect();
	if (rect.height === 0) return null;

	return {
		top: rect.bottom,
		left: anchorOffset > 0 ? rect.right : rect.left,
	};
}

type MenuMode = "typing" | "browsing";

type MenuState = {
	mode: MenuMode;
	queryString: string;
	position: { top: number; left: number };
};

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
	const ghostDomRef = useRef<HTMLElement | null>(null);

	menuStateRef.current = menuState;

	const queryString = menuState?.queryString ?? null;
	const menuMode = menuState?.mode ?? null;

	const queryStringRef = useRef(queryString);
	queryStringRef.current = queryString;

	const openMenu = useCallback((state: MenuState) => {
		setMenuState(state);
		setSelectedIndex(null);
	}, []);

	const closeMenu = useCallback(() => {
		setMenuState(null);
	}, []);

	/**
	 * Track mousedown on the editor to distinguish clicking from typing.
	 * Track Escape keydown to detect Escape-caused blur.
	 * Handle blur: close the menu and refocus when appropriate.
	 * This also covers Firefox's behavior of blurring contenteditable
	 * on Escape (even without autocomplete open).
	 */
	useEffect(() => {
		function onMouseDown(e: MouseEvent) {
			escapeRef.current = false;
			const root = editor.getRootElement();
			if (root?.contains(e.target as Node)) {
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
			if (e.key === "Escape") {
				escapePendingRef.current = true;
			}
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
				requestAnimationFrame(() => {
					editor.getRootElement()?.focus();
				});
				return;
			}
			// No menu open — refocus if Escape caused the blur (Firefox).
			if (escapePendingRef.current) {
				escapePendingRef.current = false;
				requestAnimationFrame(() => {
					editor.getRootElement()?.focus();
				});
			}
		}

		document.addEventListener("mousedown", onMouseDown, true);
		document.addEventListener("mouseup", onMouseUp, true);
		document.addEventListener("keydown", onKeyDown, true);
		document.addEventListener("keyup", onKeyUp, true);

		const removeRootListener = editor.registerRootListener(
			(rootElement, prevRootElement) => {
				prevRootElement?.removeEventListener("blur", onBlur);
				rootElement?.addEventListener("blur", onBlur);
			},
		);

		return () => {
			document.removeEventListener("mousedown", onMouseDown, true);
			document.removeEventListener("mouseup", onMouseUp, true);
			document.removeEventListener("keydown", onKeyDown, true);
			document.removeEventListener("keyup", onKeyUp, true);
			removeRootListener();
		};
	}, [editor]);

	/**
	 * Core update listener — detect ingredient queries and
	 * imperatively open/close the menu.
	 */
	useEffect(() => {
		return editor.registerUpdateListener(() => {
			if (ghostDomRef.current) {
				ghostDomRef.current.removeAttribute("data-ghost");
				ghostDomRef.current = null;
			}

			editor.getEditorState().read(() => {
				const currentText = $getRoot().getTextContent();
				const textChanged = currentText !== prevTextRef.current;
				prevTextRef.current = currentText;

				if (textChanged) {
					escapeRef.current = false;
				}

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
					const query = result.matchingString.toLowerCase();
					if (ingredients.some((i) => i.name.toLowerCase() === query)) {
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

				const position = getMenuPosition();
				if (!position) {
					closeMenu();
					return;
				}

				openMenu({
					mode,
					queryString: result.matchingString,
					position,
				});
			});
		});
	}, [editor, ingredients, openMenu, closeMenu]);

	const options = useMemo(() => {
		if (!queryString || !menuMode) return [];

		if (menuMode === "browsing") {
			return ingredients.map((i) => ({
				key: i.id,
				ingredient: i,
			}));
		}

		const query = queryString.toLowerCase();
		return ingredients
			.filter((i) => i.name.toLowerCase().includes(query))
			.slice(0, 10)
			.map((i) => ({ key: i.id, ingredient: i }));
	}, [ingredients, queryString, menuMode]);

	const ghostText = useMemo(() => {
		if (!queryString || menuMode !== "typing" || options.length === 0) {
			return null;
		}

		const active = options[selectedIndex ?? 0];
		if (!active) return null;

		return getGhostCompletion(queryString, active.ingredient.name);
	}, [queryString, menuMode, options, selectedIndex]);

	useLayoutEffect(() => {
		if (!ghostText) return;

		editor.getEditorState().read(() => {
			const selection = $getSelection();
			if (!$isRangeSelection(selection) || !selection.isCollapsed()) return;

			const anchor = selection.anchor;
			if (anchor.type !== "text") return;

			const node = anchor.getNode();
			const dom = editor.getElementByKey(node.getKey());
			if (dom) {
				dom.setAttribute("data-ghost", ghostText);
				ghostDomRef.current = dom;
			}
		});

		return () => {
			if (ghostDomRef.current) {
				ghostDomRef.current.removeAttribute("data-ghost");
				ghostDomRef.current = null;
			}
		};
	}, [editor, ghostText]);

	const selectOption = useCallback(
		(option: { ingredient: Ingredient }) => {
			const matchingString = queryStringRef.current;
			if (!matchingString) return;

			editor.update(() => {
				const selection = $getSelection();
				if (!$isRangeSelection(selection) || !selection.isCollapsed()) return;

				const anchor = selection.anchor;
				if (anchor.type !== "text") return;

				const textNode = anchor.getNode();
				const text = textNode.getTextContent();
				const matchStart = text.lastIndexOf(matchingString);

				if (matchStart >= 0) {
					const before = text.slice(0, matchStart);
					const newText = before + option.ingredient.name;
					textNode.setTextContent(newText);

					let sibling = textNode.getNextSibling();
					while (sibling && $isTextNode(sibling)) {
						const next = sibling.getNextSibling();
						sibling.remove();
						sibling = next;
					}

					const offset = before.length + option.ingredient.name.length;
					selection.anchor.set(textNode.__key, offset, "text");
					selection.focus.set(textNode.__key, offset, "text");
				}
			});

			closeMenu();
		},
		[editor, closeMenu],
	);

	/**
	 * Keyboard handlers — only registered while the menu is open.
	 * Uses refs for frequently-changing values to avoid re-registration.
	 */
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
					const opts = optionsRef.current;
					selectOptionRef.current(opts[selectedIndexRef.current ?? 0]);
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

	if (!menuState || options.length === 0) return null;

	return createPortal(
		// biome-ignore lint/a11y/noStaticElementInteractions: prevents focus loss on mousedown
		<div
			onMouseDown={preventFocusLoss}
			style={{
				position: "fixed",
				top: menuState.position.top,
				left: menuState.position.left,
				zIndex: 1000,
			}}
		>
			<OptionsList
				footer={
					<button
						type="button"
						style={{
							all: "unset",
							display: "flex",
							alignItems: "center",
							gap: "var(--space-2)",
							cursor: "pointer",
							fontSize: "var(--font-size-1)",
							color: "var(--mauve-9)",
						}}
						onMouseDown={(e) => {
							e.preventDefault();
							selectOption(options[selectedIndex ?? 0]);
						}}
					>
						<Kbd shortcut="tab" visual />
						<span>to complete</span>
					</button>
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
		</div>,
		document.body,
	);
}
