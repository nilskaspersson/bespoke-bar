"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { useLayoutEffect, useRef } from "react";

/**
 * Sets a CSS `anchor-name` on the cursor's text node element
 * while the menu is open, enabling CSS anchor positioning.
 *
 * The `trigger` value controls when the anchor is re-evaluated —
 * pass the menu state object so it updates when the query changes.
 */
export function useTypeaheadAnchor(anchorName: string, trigger: unknown) {
	const [editor] = useLexicalComposerContext();
	const anchorDomRef = useRef<HTMLElement | null>(null);

	useLayoutEffect(() => {
		if (anchorDomRef.current) {
			anchorDomRef.current.style.anchorName = "";
			anchorDomRef.current = null;
		}

		if (!trigger) return;

		editor.getEditorState().read(() => {
			const selection = $getSelection();
			if (!$isRangeSelection(selection) || !selection.isCollapsed()) return;
			const anchor = selection.anchor;
			if (anchor.type !== "text") return;
			const node = anchor.getNode();
			const dom = editor.getElementByKey(node.getKey());
			if (dom) {
				dom.style.anchorName = anchorName;
				anchorDomRef.current = dom;
			}
		});

		return () => {
			if (anchorDomRef.current) {
				anchorDomRef.current.style.anchorName = "";
				anchorDomRef.current = null;
			}
		};
	}, [editor, anchorName, trigger]);
}
