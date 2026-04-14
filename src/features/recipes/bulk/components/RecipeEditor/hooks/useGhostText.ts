"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Manages ghost text (inline completion preview) on the editor's DOM.
 * Sets a `data-ghost` attribute on the cursor's text node element,
 * which CSS renders via `::after`.
 */
export function useGhostText(ghostText: string | null) {
	const [editor] = useLexicalComposerContext();
	const ghostDomRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		return editor.registerUpdateListener(() => {
			if (ghostDomRef.current) {
				ghostDomRef.current.removeAttribute("data-ghost");
				ghostDomRef.current = null;
			}
		});
	}, [editor]);

	useLayoutEffect(() => {
		if (!ghostText) return;

		editor.read(() => {
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
}
