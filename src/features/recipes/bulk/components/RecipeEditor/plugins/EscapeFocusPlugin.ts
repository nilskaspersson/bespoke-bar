"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { KEY_ESCAPE_COMMAND } from "lexical";
import { useEffect } from "react";

/**
 * Firefox blurs a contenteditable when Escape is pressed — the native behavior
 * runs below the event-handler layer, so `preventDefault()` on keydown does
 * not stop it, and the keydown may never reach JS listeners at all. Lexical's
 * `KEY_ESCAPE_COMMAND` handler (which closes the typeahead in other browsers)
 * therefore never runs on Firefox. Every major contenteditable library
 * (ProseMirror, Slate, Draft, Lexical) works around this the same way: let
 * the blur happen, then put focus back.
 *
 * On blur:
 *   1. Dispatch `KEY_ESCAPE_COMMAND` directly — runs `LexicalMenu`'s own
 *      handler (the same path as a real Escape keystroke in Chrome) and
 *      synchronously closes any open typeahead. Safe to call unconditionally:
 *      menus should close when the editor loses focus anyway.
 *   2. If the blur looks Escape-triggered — `relatedTarget` is `null` or
 *      `document.body`, meaning focus is going "nowhere" — restore focus on
 *      the next frame. Click-away and Tab-to-next-element blurs both set
 *      `relatedTarget` to the actual next focus target, so those are left
 *      alone.
 */
export function EscapeFocusPlugin() {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		const onBlur = (event: FocusEvent) => {
			editor.dispatchCommand(
				KEY_ESCAPE_COMMAND,
				new KeyboardEvent("keydown", { key: "Escape" }),
			);
			const goingNowhere =
				event.relatedTarget === null || event.relatedTarget === document.body;
			if (goingNowhere) {
				requestAnimationFrame(() => editor.getRootElement()?.focus());
			}
		};

		const unregisterRoot = editor.registerRootListener((root, prev) => {
			prev?.removeEventListener("blur", onBlur);
			root?.addEventListener("blur", onBlur);
		});

		return () => {
			editor.getRootElement()?.removeEventListener("blur", onBlur);
			unregisterRoot();
		};
	}, [editor]);

	return null;
}
