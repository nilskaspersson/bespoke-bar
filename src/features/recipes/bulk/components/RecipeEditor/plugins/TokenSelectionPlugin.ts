"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

/**
 * Firefox blurs contenteditable on Escape regardless of preventDefault.
 * Detect the Escape → blur sequence and refocus.
 */
export function TokenSelectionPlugin() {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		let escapePending = false;

		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				escapePending = true;
			}
		}

		function onKeyUp() {
			escapePending = false;
		}

		function onBlur() {
			if (escapePending) {
				escapePending = false;
				const root = editor.getRootElement();
				if (root) {
					requestAnimationFrame(() => root.focus());
				}
			}
		}

		document.addEventListener("keydown", onKeyDown, true);
		document.addEventListener("keyup", onKeyUp, true);

		const removeRootListener = editor.registerRootListener(
			(rootElement, prevRootElement) => {
				prevRootElement?.removeEventListener("blur", onBlur);
				rootElement?.addEventListener("blur", onBlur);
			},
		);

		return () => {
			document.removeEventListener("keydown", onKeyDown, true);
			document.removeEventListener("keyup", onKeyUp, true);
			removeRootListener();
		};
	}, [editor]);

	return null;
}
