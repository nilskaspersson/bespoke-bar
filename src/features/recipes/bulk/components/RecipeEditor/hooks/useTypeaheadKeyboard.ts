"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	COMMAND_PRIORITY_HIGH,
	KEY_ARROW_DOWN_COMMAND,
	KEY_ARROW_UP_COMMAND,
	KEY_ENTER_COMMAND,
	KEY_ESCAPE_COMMAND,
	KEY_TAB_COMMAND,
	mergeRegister,
} from "lexical";
import { type Dispatch, type SetStateAction, useEffect, useRef } from "react";

/**
 * Registers Lexical keyboard commands for typeahead navigation
 * while the menu is open. Uses refs internally so handlers always
 * read the latest values without re-registering on every change.
 */
export function useTypeaheadKeyboard<T>(
	isOpen: boolean,
	options: T[],
	selectedIndex: number | null,
	setSelectedIndex: Dispatch<SetStateAction<number | null>>,
	onEscape: () => void,
	onSelect: (option: T) => void,
) {
	const [editor] = useLexicalComposerContext();

	const optionsRef = useRef(options);
	optionsRef.current = options;
	const selectedIndexRef = useRef(selectedIndex);
	selectedIndexRef.current = selectedIndex;
	const onEscapeRef = useRef(onEscape);
	onEscapeRef.current = onEscape;
	const onSelectRef = useRef(onSelect);
	onSelectRef.current = onSelect;

	useEffect(() => {
		if (!isOpen) return;

		return mergeRegister(
			editor.registerCommand(
				KEY_ESCAPE_COMMAND,
				(event) => {
					event.preventDefault();
					onEscapeRef.current();
					return true;
				},
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerCommand(
				KEY_ARROW_DOWN_COMMAND,
				(event) => {
					event.preventDefault();
					setSelectedIndex((prev) => {
						const len = optionsRef.current.length;
						return prev === null ? 0 : prev < len - 1 ? prev + 1 : 0;
					});
					return true;
				},
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerCommand(
				KEY_ARROW_UP_COMMAND,
				(event) => {
					event.preventDefault();
					setSelectedIndex((prev) => {
						const len = optionsRef.current.length;
						return prev === null ? len - 1 : prev > 0 ? prev - 1 : len - 1;
					});
					return true;
				},
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerCommand(
				KEY_TAB_COMMAND,
				(event) => {
					event.preventDefault();
					const opts = optionsRef.current;
					onSelectRef.current(opts[selectedIndexRef.current ?? 0]);
					return true;
				},
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerCommand(
				KEY_ENTER_COMMAND,
				(event) => {
					const idx = selectedIndexRef.current;
					if (idx === null) return false;
					event?.preventDefault();
					onSelectRef.current(optionsRef.current[idx]);
					return true;
				},
				COMMAND_PRIORITY_HIGH,
			),
		);
	}, [editor, isOpen, setSelectedIndex]);
}
