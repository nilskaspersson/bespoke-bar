import type { KeyboardEvent, MouseEvent, SyntheticEvent } from "react";

export type DialogEvent =
	| MouseEvent<HTMLDialogElement>
	| KeyboardEvent<HTMLDialogElement>;

export function stopPropagation(e: SyntheticEvent) {
	e.stopPropagation();
}

export function stopEscapePropagation(e: KeyboardEvent) {
	if (e.key === "Escape") e.stopPropagation();
}

/**
 * Whether the event originated from this dialog rather than a nested one.
 * Also yields to open popovers inside the dialog, so the native close
 * watcher can dismiss them instead.
 */
export function isOwnDialogEvent(event: DialogEvent): boolean {
	if (!(event.target instanceof HTMLElement)) return true;
	const closest = event.target.closest("dialog");
	if (closest && closest !== event.currentTarget) return false;
	const dialog = event.currentTarget as HTMLElement;
	if (dialog.querySelector(":popover-open")) return false;
	return true;
}
