"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { useLayoutEffect } from "react";
import { getGhostCompletion } from "@/features/recipes/bulk/utils/getGhostCompletion";

/**
 * Writes the completion suffix of the currently highlighted option as a
 * `data-ghost` attribute on the editor element that contains the caret —
 * CSS renders the value via `::after`. Works for any menu whose items can
 * be projected to a display label via `getLabel`.
 *
 * Exists as a component (rendering null) rather than an inline hook call
 * because it's rendered inside `LexicalTypeaheadMenuPlugin`'s render-prop
 * callback, where the caller's hook-ownership context isn't usable. The
 * effect re-applies on every Lexical update: typing a character swaps the
 * underlying TextNode (and its DOM element), so the old ghost-bearing
 * element is detached and we need to transfer the attribute onto the new
 * cursor-adjacent element. `useLayoutEffect` keeps that work inside the
 * same paint as React's commit so there's no visible flicker.
 */
export function GhostTextController<T>({
	query,
	options,
	selectedIndex,
	getLabel,
}: {
	query: string | null;
	options: T[];
	selectedIndex: number | null;
	getLabel: (option: T) => string;
}) {
	const [editor] = useLexicalComposerContext();
	const active = options[selectedIndex ?? 0];
	const ghostText =
		query && active ? getGhostCompletion(query, getLabel(active)) : null;

	useLayoutEffect(() => {
		if (!ghostText) return;
		const text = ghostText;

		function clear() {
			editor
				.getRootElement()
				?.querySelector("[data-ghost]")
				?.removeAttribute("data-ghost");
		}

		function apply() {
			clear();
			editor.read(() => {
				const selection = $getSelection();
				if (!$isRangeSelection(selection) || !selection.isCollapsed()) return;
				const anchor = selection.anchor;
				if (anchor.type !== "text") return;
				const dom = editor.getElementByKey(anchor.getNode().getKey());
				dom?.setAttribute("data-ghost", text);
			});
		}

		apply();
		const unregister = editor.registerUpdateListener(apply);
		return () => {
			unregister();
			clear();
		};
	}, [editor, ghostText]);

	return null;
}
