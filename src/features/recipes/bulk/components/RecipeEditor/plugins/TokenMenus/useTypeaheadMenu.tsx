"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type {
	MenuOption,
	MenuRenderFn,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { createDOMRange } from "@lexical/selection";
import {
	$getSelection,
	$isRangeSelection,
	$isTextNode,
	type LexicalEditor,
} from "lexical";
import {
	type ReactNode,
	type RefObject,
	type ToggleEventHandler,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { type UsePopoverReturn, usePopover } from "@/hooks/usePopover";
import { PopoverAnchor } from "@/ui/Popover";
import { GhostTextController } from "./GhostTextController";
import { TokenMenu } from "./TokenMenu";

/**
 * Snapshot the current typeahead token's position as a zero-height point
 * at `(tokenStart.x, lineBaseline.y)` — the placement we want the menu
 * anchored to. Reads the Lexical selection (guaranteed to be the caret
 * at the end of the query while the typeahead is active), walks back by
 * `queryLength` characters, and hands the span to `@lexical/selection`'s
 * `createDOMRange` for the DOM resolution. Must be called inside a
 * Lexical read context (the `editor.read` wrapper below).
 */
function $resolveTokenAnchorRect(
	editor: LexicalEditor,
	queryLength: number,
): DOMRect | null {
	const selection = $getSelection();
	if (!$isRangeSelection(selection) || !selection.isCollapsed()) return null;
	const node = selection.anchor.getNode();
	if (!$isTextNode(node)) return null;
	const end = selection.anchor.offset;
	const start = Math.max(0, end - queryLength);
	const range = createDOMRange(editor, node, start, node, end);
	if (!range) return null;
	const { left, bottom } = range.getBoundingClientRect();
	return new DOMRect(left, bottom, 0, 0);
}

type RenderOptionArgs<T> = {
	option: T;
	index: number;
	isHighlighted: boolean;
	onSelect: () => void;
	onHighlight: () => void;
};

type UseTypeaheadMenuProps<T extends MenuOption> = {
	options: T[];
	query: string | null;
	getLabel: (option: T) => string;
	renderOption: (args: RenderOptionArgs<T>) => ReactNode;
};

/**
 * Wraps `LexicalTypeaheadMenuPlugin`'s `menuRenderFn` with the popover
 * plumbing: top-layer menu + ghost-text controller, session-scoped
 * anchor rect capture (token start, line baseline), and entry-animation
 * suppression on remount.
 *
 * Returns a `menuRenderFn` ready to pass to the Lexical plugin. Caller
 * still owns the option search, trigger function, and select handler —
 * just give us what to render per option.
 */
export function useTypeaheadMenu<T extends MenuOption>({
	options,
	query,
	getLabel,
	renderOption,
}: UseTypeaheadMenuProps<T>): MenuRenderFn<T> {
	const popover = usePopover({ type: "manual" });
	const anchorId = `${popover.popoverId}-anchor`;
	const sessionOpen = useRef(false);
	const sessionAnchorRect = useRef<DOMRect | null>(null);

	return (
		anchorElementRef,
		{ selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
	) => {
		if (!anchorElementRef.current || options.length === 0) {
			sessionOpen.current = false;
			sessionAnchorRect.current = null;
			return null;
		}
		const suppressEntryAnimation = sessionOpen.current;
		sessionOpen.current = true;
		return (
			<TypeaheadContent
				sessionAnchorRect={sessionAnchorRect}
				sessionQueryLength={query?.length ?? 0}
				anchorId={anchorId}
				popover={popover}
				options={options}
				query={query}
				selectedIndex={selectedIndex}
				onSelect={selectOptionAndCleanUp}
				onHighlight={setHighlightedIndex}
				suppressEntryAnimation={suppressEntryAnimation}
				getLabel={getLabel}
				renderOption={renderOption}
			/>
		);
	};
}

type TypeaheadContentProps<T extends MenuOption> = {
	sessionAnchorRect: RefObject<DOMRect | null>;
	sessionQueryLength: number;
	anchorId: string;
	popover: UsePopoverReturn;
	options: T[];
	query: string | null;
	selectedIndex: number | null;
	onSelect: (option: T) => void;
	onHighlight: (index: number) => void;
	suppressEntryAnimation: boolean;
	getLabel: (option: T) => string;
	renderOption: (args: RenderOptionArgs<T>) => ReactNode;
};

function TypeaheadContent<T extends MenuOption>({
	sessionAnchorRect,
	sessionQueryLength,
	anchorId,
	popover,
	options,
	query,
	selectedIndex,
	onSelect,
	onHighlight,
	suppressEntryAnimation,
	getLabel,
	renderOption,
}: TypeaheadContentProps<T>) {
	const [editor] = useLexicalComposerContext();

	/**
	 * Re-assert `openPopover` on every render. The Lexical typeahead
	 * rebuilds its portal target on every keystroke, briefly detaching
	 * the popover element — which implicitly closes the native popover.
	 * Running this effect on each commit pushes it back open;
	 * `showPopover` on an already-open popover is a no-op.
	 */
	const { openPopover } = popover;
	useLayoutEffect(() => {
		openPopover();
	});

	/**
	 * Sync the native dismissal back to Lexical.
	 */
	const closeOnNativeDismiss: ToggleEventHandler<HTMLDivElement> = (event) => {
		popover.contentProps.onToggle(event);
		if (event.target !== event.currentTarget || event.newState !== "closed") {
			return;
		}
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) selection.anchor.getNode().markDirty();
		});
	};

	const [anchorRect, setAnchorRect] = useState<DOMRect | null>(
		sessionAnchorRect.current,
	);

	useLayoutEffect(() => {
		if (sessionAnchorRect.current) return;
		const rect = editor
			.getEditorState()
			.read(() => $resolveTokenAnchorRect(editor, sessionQueryLength));
		if (!rect) return;
		sessionAnchorRect.current = rect;
		setAnchorRect(rect);
	}, [editor, sessionAnchorRect, sessionQueryLength]);

	return (
		<>
			<GhostTextController
				query={query}
				options={options}
				selectedIndex={selectedIndex}
				getLabel={getLabel}
			/>

			{anchorRect ? (
				<>
					<PopoverAnchor
						top={anchorRect.top}
						left={anchorRect.left}
						anchorName={`--${anchorId}`}
					/>

					<TokenMenu
						{...popover.contentProps}
						onToggle={closeOnNativeDismiss}
						anchorId={anchorId}
						position="bottom-start"
						footerAction="complete"
						keepAnchored
						suppressEntryAnimation={suppressEntryAnimation}
					>
						{options.map((option, index) =>
							renderOption({
								option,
								index,
								isHighlighted: selectedIndex === index,
								onSelect: () => {
									onHighlight(index);
									onSelect(option);
								},
								onHighlight: () => onHighlight(index),
							}),
						)}
					</TokenMenu>
				</>
			) : null}
		</>
	);
}
