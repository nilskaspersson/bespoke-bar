import type { KeyboardEvent, SyntheticEvent } from "react";

export function stopPropagation(e: SyntheticEvent) {
	e.stopPropagation();
}

/** @public */
export function stopEscapePropagation(e: KeyboardEvent) {
	if (e.key === "Escape") e.stopPropagation();
}
