"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { useLayoutEffect } from "react";

/**
 * Paints ghost text (inline completion preview) as a `data-ghost` attribute
 * on the editor element that contains the current caret. CSS renders the
 * value via `::after`, so there's no React node to hold the state — the
 * attribute itself is the source of truth.
 *
 * The effect re-applies on every Lexical update: typing a character swaps
 * the underlying TextNode (and its DOM element) for a new one, so the old
 * ghost-bearing element is detached and we need to transfer the attribute
 * onto the new cursor-adjacent element. `useLayoutEffect` keeps that work
 * inside the same paint as React's commit so there's no visible flicker.
 */
export function useGhostText(ghostText: string | null) {
	const [editor] = useLexicalComposerContext();

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
}
