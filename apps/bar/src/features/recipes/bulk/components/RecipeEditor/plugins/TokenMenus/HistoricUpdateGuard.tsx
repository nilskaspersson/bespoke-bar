"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HISTORIC_TAG } from "lexical";
import {
	createContext,
	type ReactNode,
	type RefObject,
	useContext,
	useEffect,
	useRef,
} from "react";

const HistoricUpdateContext = createContext<RefObject<boolean> | null>(null);

/**
 * Shares a ref that reads `true` only while an undo/redo update is being
 * applied. The typeahead trigger reads it to avoid popping the menu open when
 * history scrubbing restores a caret at a query boundary.
 */
export function HistoricUpdateProvider({ children }: { children: ReactNode }) {
	const historicRef = useRef(false);
	return (
		<HistoricUpdateContext.Provider value={historicRef}>
			{children}
		</HistoricUpdateContext.Provider>
	);
}

export function useHistoricUpdateRef(): RefObject<boolean> {
	const historicRef = useContext(HistoricUpdateContext);
	if (!historicRef) {
		throw new Error(
			"useHistoricUpdateRef must be used inside <HistoricUpdateProvider>",
		);
	}
	return historicRef;
}

/**
 * Flags each update as historic (undo/redo) or not, from its tags. Render this
 * before the typeahead plugins: its update listener then registers — and so
 * fires — ahead of `LexicalTypeaheadMenuPlugin`'s listener, which reads the
 * flag through the trigger on the same update.
 */
export function HistoricUpdateGuard() {
	const [editor] = useLexicalComposerContext();
	const historicRef = useHistoricUpdateRef();
	useEffect(
		() =>
			editor.registerUpdateListener(({ tags }) => {
				historicRef.current = tags.has(HISTORIC_TAG);
			}),
		[editor, historicRef],
	);
	return null;
}
