"use client";

import { clsx } from "clsx";
import type { DialogHTMLAttributes } from "react";
import { type DialogEvent, isOwnDialogEvent } from "@/utils/events";
import { handleKey } from "@/utils/keyboard";
import styles from "./styles.module.css";

const handleKeyboardClose = (event: DialogEvent) => {
	if (
		event.target instanceof HTMLDialogElement &&
		event.target.nodeName === "DIALOG"
	) {
		event.target.close("dismiss");
		return;
	}

	if (
		(event.target instanceof HTMLButtonElement &&
			event.target.nodeName === "BUTTON") ||
		(event.target instanceof HTMLAnchorElement && event.target.nodeName === "A")
	) {
		event.target.closest("dialog")?.close("dismiss");
	}
};

export function Dialog({
	children,
	className,
	handleClose,
	ref,
	...props
}: DialogHTMLAttributes<HTMLDialogElement> & {
	handleClose?: () => void;
	onClose?: () => void;
	ref: React.RefObject<HTMLDialogElement | null>;
}) {
	function onBackdropClick(event: DialogEvent) {
		if (event.target === event.currentTarget) {
			handleClose
				? handleClose()
				: (event.currentTarget as HTMLDialogElement).close("dismiss");
		}
	}

	function onEscape(event: DialogEvent) {
		if (handleClose) {
			handleClose();
			return;
		}
		handleKeyboardClose(event);
	}

	/**
	 * The native cancel event fires via the close watcher when the user
	 * presses Escape — even if focus is outside the dialog (e.g. after a
	 * stacked dialog closes and focus can't be restored). In that case the
	 * keydown never reaches our onKeyDown handler, so we intercept cancel
	 * to keep the close lifecycle in React's control.
	 */
	function onCancel(event: React.SyntheticEvent<HTMLDialogElement>) {
		event.preventDefault();
		handleClose ? handleClose() : event.currentTarget.close("dismiss");
	}

	return (
		<dialog
			ref={ref}
			className={clsx(className, styles.dialog)}
			onClick={onBackdropClick}
			onKeyDown={handleKey([["Escape", onEscape, isOwnDialogEvent]])}
			onCancel={onCancel}
			{...props}
		>
			{children}
		</dialog>
	);
}
