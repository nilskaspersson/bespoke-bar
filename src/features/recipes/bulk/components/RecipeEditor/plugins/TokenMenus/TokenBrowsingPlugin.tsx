"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$createRangeSelection,
	$getNearestNodeFromDOMNode,
	$getNodeByKey,
	$isParagraphNode,
	$isTextNode,
	$setSelection,
	CLICK_COMMAND,
	COMMAND_PRIORITY_LOW,
	type LexicalEditor,
} from "lexical";
import {
	type Dispatch,
	type FocusEvent as ReactFocusEvent,
	type KeyboardEvent as ReactKeyboardEvent,
	type SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { getIngredientId } from "@/features/ingredients/utils";
import type { IngredientIndex } from "@/features/ingredients/utils/buildIngredientIndex";
import { quantityTextParser } from "@/features/quantity/utils/parseQuantity";
import {
	type Token,
	tokenizeLine,
} from "@/features/recipes/bulk/utils/tokenizeLine";
import { SORTED_UNITS, UNIT_SEARCH_INDEX } from "@/features/units/constants";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { usePopover } from "@/hooks/usePopover";
import { Input } from "@/ui/Input";
import { PopoverAnchor } from "@/ui/Popover";
import { searchByIndex } from "@/utils/search";
import { useRecipeIngredients } from "../../hooks/useRecipeIngredients";
import {
	createParagraphDOMRange,
	locateTextNodeAtOffset,
} from "../../utils/paragraphRange";
import { IngredientOption } from "./IngredientOption";
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
 *
 * Uses Lexical's `RangeSelection.insertText()` rather than clearing the
 * paragraph and appending a single `TextNode`: that preserves the
 * identities of `TextNode`s outside the replaced span, which keeps undo
 * history granular and plays nicely with collaborative editing if we
 * ever add it. `insertText` also handles multi-node spans (a token that
 * straddles two `TextNode`s) correctly — something the old approach
 * brute-forced by rebuilding everything.
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
		const anchor = locateTextNodeAtOffset(paragraph, tokenStart, false);
		const focus = locateTextNodeAtOffset(paragraph, tokenEnd, true);
		if (!anchor || !focus) return;

		const selection = $createRangeSelection();
		selection.anchor.set(anchor.node.getKey(), anchor.offset, "text");
		selection.focus.set(focus.node.getKey(), focus.offset, "text");
		$setSelection(selection);
		selection.insertText(replacement);
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
	const { ingredientIndex } = useRecipeIngredients();

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

	if (!state) return null;

	return <BrowsingSession state={state} setState={setState} editor={editor} />;
}

/**
 * Lives exactly as long as the browsing popover is meant to be open —
 * mount runs `openPopover` once, unmount removes the element. The parent
 * setting `state` to `null` is what drives the close, so there's no
 * imperative state-to-DOM sync effect: "visible" is "mounted".
 */
function BrowsingSession({
	state,
	setState,
	editor,
}: {
	state: BrowsingState;
	setState: Dispatch<SetStateAction<BrowsingState | null>>;
	editor: LexicalEditor;
}) {
	const popover = usePopover({ type: "manual" });
	const { openPopover, popoverId } = popover;
	const searchInputRef = useRef<HTMLInputElement>(null);
	const anchorId = `${popoverId}-anchor`;

	const { sortedIngredients, searchIndex } = useRecipeIngredients();

	/**
	 * Show the popover and land focus on the search input. Runs once on
	 * mount — `openPopover` is stable via `useCallback`. Focus happens
	 * *after* `showPopover` so the input isn't `display: none` at focus
	 * time (which would silently no-op).
	 */
	useEffect(() => {
		openPopover();
		searchInputRef.current?.focus();
	}, [openPopover]);

	/**
	 * Any pointer interaction outside the popover closes it. Document-level
	 * capture phase so clicks on the page background, sidebar, etc. are
	 * caught regardless of which element they land on. `[popover]` elements
	 * render in the top layer; we identify them via the popover id. The
	 * listener only exists while this component is mounted — no extra
	 * `isOpen` guard needed.
	 */
	useEffect(() => {
		function handlePointerDown(event: PointerEvent) {
			if (!(event.target instanceof Element)) return;
			if (event.target.closest(`#${CSS.escape(popoverId)}`)) return;
			setState(null);
			editor.focus();
		}
		document.addEventListener("pointerdown", handlePointerDown, true);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown, true);
		};
	}, [popoverId, editor, setState]);

	const { variant, query } = state;

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
			: filteredUnits.length;

	function closeMenu() {
		setState(null);
		editor.focus();
	}

	function commit(replacement: string) {
		applyTokenReplacement(
			editor,
			state.paragraphKey,
			state.tokenStart,
			state.tokenEnd,
			replacement,
		);
		closeMenu();
	}

	function commitSelected() {
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
				closeMenu();
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
		closeMenu();
	}

	/**
	 * Callback ref that stores the element and, on each remount, grabs
	 * focus. The input's `key` changes on token switch so React unmounts
	 * and remounts the element; at that point the popover is already
	 * visible, so `focus()` takes effect immediately. On the *first* mount
	 * of a browsing session the popover is still `display: none`, so this
	 * focus call is a no-op — the mount effect above calls focus again
	 * after `showPopover` flips the popover visible.
	 *
	 * Stabilised with `useCallback` so React doesn't detach/reattach (and
	 * refire `focus()`) on every unrelated re-render — e.g. typing in the
	 * search input would otherwise trigger a pointless focus call per
	 * keystroke.
	 */
	const assignSearchInput = useCallback((el: HTMLInputElement | null) => {
		searchInputRef.current = el;
		el?.focus();
	}, []);

	const searchInput = (
		<Input
			key={`${state.paragraphKey}:${state.tokenStart}`}
			ref={assignSearchInput}
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

	return (
		<>
			{/**
			 * Anchor at the zero-height point just below the clicked token —
			 * the `-start` popover variants align the menu to the anchor's
			 * top edge, so the anchor position itself needs to be where we
			 * want the menu to land.
			 */}
			<PopoverAnchor
				top={state.anchorRect.bottom}
				left={state.anchorRect.left}
				width={state.anchorRect.width}
				anchorName={`--${anchorId}`}
			/>
			<TokenMenu
				{...popover.contentProps}
				isOpen
				anchorId={anchorId}
				position="bottom-start"
				footerAction="replace"
				header={searchInput}
			>
				{options}
			</TokenMenu>
		</>
	);
}
