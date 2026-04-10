"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";

/**
 * Tracks mouse, keyboard (Escape), and blur interactions on a
 * Lexical editor. Manages focus restoration after Escape-caused
 * blur (Firefox) and closes an associated menu on blur.
 *
 * Returns refs that the consumer reads to determine interaction
 * context (e.g., "was this update caused by a click?").
 */
export function useEditorFocus(
	menuStateRef: React.RefObject<unknown>,
	close: () => void,
) {
	const [editor] = useLexicalComposerContext();
	const mouseDownRef = useRef(false);
	const escapeRef = useRef(false);
	const escapePendingRef = useRef(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: menuStateRef is a stable ref, read inside callbacks
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
					close();
					return;
				}
				escapeRef.current = true;
				close();
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
	}, [editor, close]);

	return { mouseDownRef, escapeRef };
}
