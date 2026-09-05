"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { IS_FIREFOX } from "@lexical/utils";
import { COMMAND_PRIORITY_LOW, KEY_ESCAPE_COMMAND } from "lexical";
import { useEffect } from "react";

/**
 * Chromium and WebKit do nothing to a contenteditable when Escape is pressed,
 * so we register a low-priority `KEY_ESCAPE_COMMAND` handler that blurs the
 * editor once any higher-priority handlers (typeahead, browsing) have had
 * their turn. This only runs when the user is on a non-Firefox browser —
 * Firefox blurs natively (see below).
 *
 * Firefox blurs a contenteditable when Escape is pressed — the native behavior
 * runs below the event-handler layer, so `preventDefault()` on keydown does
 * not stop it, and the keydown may never reach JS listeners at all. Lexical's
 * `KEY_ESCAPE_COMMAND` handler (which closes the typeahead in other browsers)
 * therefore never runs on Firefox. Every major contenteditable library
 * (ProseMirror, Slate, Draft, Lexical) works around this the same way: let
 * the blur happen, then put focus back — *only* when the blur looks like it
 * was caused by Escape while a menu was open. Specifically:
 *
 *   1. Bail early if `relatedTarget` points at another element — that's a
 *      normal click-away / tab move, not Escape, and the blur should stand.
 *   2. Dispatch `KEY_ESCAPE_COMMAND` directly so any open typeahead's own
 *      handler runs (same code path as a real keystroke in Chrome). If one
 *      of the high-priority handlers consumes it, we know a menu *was* open
 *      and the blur was an unwanted side effect — restore focus on the next
 *      frame. If nothing consumes it, nothing was open and the user just
 *      wanted to Escape out of the editor — leave it blurred.
 */
export function EscapeFocusPlugin() {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		if (!IS_FIREFOX) {
			return editor.registerCommand(
				KEY_ESCAPE_COMMAND,
				() => {
					editor.getRootElement()?.blur();
					return true;
				},
				COMMAND_PRIORITY_LOW,
			);
		}

		const onBlur = (event: FocusEvent) => {
			const goingNowhere =
				event.relatedTarget === null || event.relatedTarget === document.body;
			if (!goingNowhere) return;

			const wasConsumed = editor.dispatchCommand(
				KEY_ESCAPE_COMMAND,
				new KeyboardEvent("keydown", { key: "Escape" }),
			);
			if (wasConsumed) {
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
