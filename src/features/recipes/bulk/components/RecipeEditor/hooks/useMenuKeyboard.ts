"use client";

import { mergeRegister } from "@lexical/utils";
import {
	COMMAND_PRIORITY_HIGH,
	KEY_ARROW_DOWN_COMMAND,
	KEY_ARROW_UP_COMMAND,
	KEY_ENTER_COMMAND,
	KEY_ESCAPE_COMMAND,
	KEY_TAB_COMMAND,
	type LexicalCommand,
	type LexicalEditor,
} from "lexical";
import { useEffect, useRef } from "react";

type MenuKeyboardHandlers = {
	onMove: (delta: 1 | -1) => void;
	onCommit: () => void;
	onClose: () => void;
};

/**
 * Registers the standard menu key bindings (Escape, Arrow up/down, Enter,
 * Tab) at high priority while `isOpen` is true. Handlers are mirrored into
 * a ref so updating them does not re-register the commands — the effect
 * only tears down when `editor` or `isOpen` changes. `LexicalTypeaheadMenuPlugin`
 * ships its own version of this for typeahead; this hook gives the browsing
 * plugin the same ergonomics without re-implementing the boilerplate.
 */
export function useMenuKeyboard(
	editor: LexicalEditor,
	isOpen: boolean,
	handlers: MenuKeyboardHandlers,
) {
	const handlersRef = useRef(handlers);
	handlersRef.current = handlers;

	useEffect(() => {
		if (!isOpen) return;
		const bind = (
			command: LexicalCommand<KeyboardEvent | null>,
			handler: (h: MenuKeyboardHandlers) => void,
		) =>
			editor.registerCommand(
				command,
				(event) => {
					event?.preventDefault();
					handler(handlersRef.current);
					return true;
				},
				COMMAND_PRIORITY_HIGH,
			);

		return mergeRegister(
			bind(KEY_ESCAPE_COMMAND, (h) => h.onClose()),
			bind(KEY_ARROW_DOWN_COMMAND, (h) => h.onMove(1)),
			bind(KEY_ARROW_UP_COMMAND, (h) => h.onMove(-1)),
			bind(KEY_ENTER_COMMAND, (h) => h.onCommit()),
			bind(KEY_TAB_COMMAND, (h) => h.onCommit()),
		);
	}, [editor, isOpen]);
}
