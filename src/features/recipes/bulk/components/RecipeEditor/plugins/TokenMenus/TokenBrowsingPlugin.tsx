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
	type LexicalEditor,
} from "lexical";
import {
	type FocusEvent as ReactFocusEvent,
	type KeyboardEvent as ReactKeyboardEvent,
	useEffect,
	useMemo,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { getIngredientId } from "@/features/ingredients/utils";
import type { IngredientIndex } from "@/features/ingredients/utils/buildIngredientIndex";
import { quantityTextParser } from "@/features/quantity/utils/parseQuantity";
import {
	type Token,
	tokenizeLine,
} from "@/features/recipes/bulk/utils/tokenizeLine";
import { SORTED_UNITS, UNIT_SEARCH_INDEX } from "@/features/units/constants";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { Input } from "@/ui/Input";
import { searchByIndex } from "@/utils/search";
import { useRecipeIngredients } from "../../hooks/useRecipeIngredients";
import { createParagraphDOMRange } from "../../utils/paragraphRange";
import { IngredientOption } from "./IngredientOption";
import styles from "./styles.module.css";
import { TokenMenu } from "./TokenMenu";
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
	query: string;
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

/**
 * Replace the text between `tokenStart..tokenEnd` in the paragraph
 * identified by `paragraphKey` with `replacement`, then drop the caret at
 * the end of the replacement. Must be called outside an active Lexical
 * update — we start our own here.
 */
function applyTokenReplacement(
	editor: LexicalEditor,
	paragraphKey: string,
	tokenStart: number,
	tokenEnd: number,
	replacement: string,
) {
	editor.update(() => {
		const paragraph = $getNodeByKey(paragraphKey);
		if (!$isParagraphNode(paragraph)) return;
		const text = paragraph.getTextContent();
		const replaced =
			text.slice(0, tokenStart) + replacement + text.slice(tokenEnd);
		for (const child of paragraph.getChildren()) child.remove();
		const newText = $createTextNode(replaced);
		paragraph.append(newText);
		const caret = tokenStart + replacement.length;
		newText.select(caret, caret);
	});
}

/**
 * Inspect a click event inside the editor and figure out whether it landed
 * inside a browsable token (ingredient or unit). Must be called inside an
 * `editor.read(...)` so Lexical node accessors resolve. Returns `null` for
 * clicks that miss a token — the caller is expected to close the popover.
 */
function resolveBrowsingStateFromClick(
	event: MouseEvent,
	editor: LexicalEditor,
	ingredientIndex: IngredientIndex,
): BrowsingState | null {
	const target = event.target;
	if (!(target instanceof Node)) return null;

	const lexNode = $getNearestNodeFromDOMNode(target);
	if (!$isTextNode(lexNode)) return null;

	const paragraph = lexNode.getParent();
	if (!$isParagraphNode(paragraph)) return null;

	const { tokens } = tokenizeLine(paragraph.getTextContent(), ingredientIndex);

	for (const token of tokens) {
		if (token.type !== "ingredient" && token.type !== "unit") continue;

		/**
		 * Measure the bounding rect of the token's characters via a DOM
		 * Range. Only resolve if the click coordinates landed inside that
		 * rect — not just near it.
		 */
		const range = createParagraphDOMRange(
			editor,
			paragraph,
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
			query: "",
		};
		return token.type === "ingredient"
			? { ...base, variant: "ingredient" }
			: { ...base, variant: "unit", quantity: resolveUnitQuantity(tokens) };
	}

	return null;
}

export function TokenBrowsingPlugin() {
	const [editor] = useLexicalComposerContext();
	const [state, setState] = useState<BrowsingState | null>(null);
	const { sortedIngredients, searchIndex, ingredientIndex } =
		useRecipeIngredients();

	const variant = state?.variant;
	const query = state?.query ?? "";

	useEffect(() => {
		return editor.registerCommand(
			CLICK_COMMAND,
			(event: MouseEvent) => {
				editor.read(() => {
					setState(
						resolveBrowsingStateFromClick(event, editor, ingredientIndex),
					);
				});
				return false;
			},
			COMMAND_PRIORITY_LOW,
		);
	}, [editor, ingredientIndex]);

	/**
	 * Close the menu on any text mutation (typing in the editor, deleting).
	 * Lexical reports text changes via `dirtyLeaves` — selection-only updates
	 * leave it empty, so we don't race with the click-to-open command that
	 * has just moved the cursor. Typing in the browsing menu's own search
	 * input doesn't trigger the editor's update listener at all, since the
	 * input isn't a Lexical node.
	 */
	useEffect(() => {
		return editor.registerUpdateListener(({ dirtyLeaves }) => {
			if (dirtyLeaves.size > 0) setState(null);
		});
	}, [editor]);

	/**
	 * Any pointer interaction outside the popover closes it. Document-level
	 * capture phase so clicks on the page background, sidebar, etc. are
	 * caught regardless of which element they land on.
	 */
	const isOpen = state !== null;
	useEffect(() => {
		if (!isOpen) return;
		function handlePointerDown(event: PointerEvent) {
			if (!(event.target instanceof Element)) return;
			if (event.target.closest(`.${styles.browsingPopover}`)) return;
			setState(null);
			editor.focus();
		}
		document.addEventListener("pointerdown", handlePointerDown, true);
		return () =>
			document.removeEventListener("pointerdown", handlePointerDown, true);
	}, [isOpen, editor]);

	const filteredIngredients = useMemo(() => {
		if (variant !== "ingredient") return [];
		return searchByIndex(
			sortedIngredients,
			searchIndex,
			getIngredientId,
			query,
		);
	}, [variant, query, sortedIngredients, searchIndex]);

	const filteredUnits = useMemo(() => {
		if (variant !== "unit") return [];
		return searchByIndex(SORTED_UNITS, UNIT_SEARCH_INDEX, (u) => u, query);
	}, [variant, query]);

	const itemCount =
		variant === "ingredient"
			? filteredIngredients.length
			: variant === "unit"
				? filteredUnits.length
				: 0;

	function closePopover() {
		setState(null);
		editor.focus();
	}

	function commit(replacement: string) {
		if (!state) return;
		applyTokenReplacement(
			editor,
			state.paragraphKey,
			state.tokenStart,
			state.tokenEnd,
			replacement,
		);
		closePopover();
	}

	function commitSelected() {
		if (!state) return;
		if (state.variant === "ingredient") {
			const selected = filteredIngredients[state.selectedIndex];
			if (selected) commit(selected.name);
		} else {
			const selected = filteredUnits[state.selectedIndex];
			if (selected) commit(getFormattedUnit(selected, state.quantity));
		}
	}

	function moveSelection(delta: 1 | -1) {
		if (itemCount === 0) return;
		setState((prev) =>
			prev
				? {
						...prev,
						selectedIndex: (prev.selectedIndex + delta + itemCount) % itemCount,
					}
				: prev,
		);
	}

	function highlightOption(index: number) {
		setState((prev) => (prev ? { ...prev, selectedIndex: index } : prev));
	}

	function onSearchKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				moveSelection(1);
				return;
			case "ArrowUp":
				event.preventDefault();
				moveSelection(-1);
				return;
			case "Enter":
			case "Tab":
				event.preventDefault();
				commitSelected();
				return;
			case "Escape":
				event.preventDefault();
				closePopover();
				return;
		}
	}

	function onSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
		const next = event.target.value;
		setState((prev) =>
			prev ? { ...prev, query: next, selectedIndex: 0 } : prev,
		);
	}

	/**
	 * Firefox blurs focused inputs on Escape at a layer below JS — the
	 * keydown event doesn't reach React, so `onSearchKeyDown`'s Escape case
	 * never fires. Mirror `EscapeFocusPlugin`'s workaround: when the input
	 * blurs "going nowhere" (relatedTarget null or `document.body`), treat
	 * it as Escape and close. List-item clicks don't trigger this because
	 * the `<li>`s are non-focusable, so focus never leaves the input.
	 */
	function onSearchBlur(event: ReactFocusEvent<HTMLInputElement>) {
		if (event.relatedTarget && event.relatedTarget !== document.body) return;
		closePopover();
	}

	if (!state) return null;

	const searchInput = (
		<Input
			key={`${state.paragraphKey}:${state.tokenStart}`}
			autoFocus
			compact
			fullWidth
			placeholder="Type to filter…"
			value={state.query}
			onChange={onSearchChange}
			onKeyDown={onSearchKeyDown}
			onBlur={onSearchBlur}
		/>
	);

	const options =
		state.variant === "ingredient"
			? filteredIngredients.map((ingredient, index) => (
					<IngredientOption
						key={ingredient.id}
						ref={state.selectedIndex === index ? scrollIntoViewRef : undefined}
						ingredient={ingredient}
						isHighlighted={state.selectedIndex === index}
						onClick={() => commit(ingredient.name)}
						onMouseEnter={() => highlightOption(index)}
					/>
				))
			: filteredUnits.map((unit, index) => (
					<UnitOption
						key={unit}
						ref={state.selectedIndex === index ? scrollIntoViewRef : undefined}
						unit={unit}
						isHighlighted={state.selectedIndex === index}
						onClick={() => commit(getFormattedUnit(unit, state.quantity))}
						onMouseEnter={() => highlightOption(index)}
					/>
				));

	return createPortal(
		<div
			className={styles.browsingPopover}
			style={{
				top: state.anchorRect.bottom + window.scrollY,
				left: state.anchorRect.left + window.scrollX,
			}}
		>
			<TokenMenu footerAction="replace" header={searchInput}>
				{options}
			</TokenMenu>
		</div>,
		document.body,
	);
}
