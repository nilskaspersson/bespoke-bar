"use client";

import { clsx } from "clsx";
import type { DialogHTMLAttributes, KeyboardEvent, MouseEvent } from "react";
import { handleKey } from "@/utils/keyboard";
import styles from "./styles.module.css";

type DialogEvent =
	| MouseEvent<HTMLDialogElement>
	| KeyboardEvent<HTMLDialogElement>;

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
		if (
			event.target instanceof HTMLDialogElement &&
			event.target.nodeName === "DIALOG"
		) {
			typeof handleClose === "function"
				? handleClose()
				: event.target.close("dismiss");
		}
	}

	function onEscape(event: DialogEvent) {
		if (typeof handleClose === "function") {
			handleClose();
			return;
		}

		handleKeyboardClose(event);
	}

	return (
		<dialog
			ref={ref}
			className={clsx(className, styles.dialog)}
			onClick={onBackdropClick}
			onKeyDown={handleKey([["Escape", onEscape]])}
			{...props}
		>
			{children}
		</dialog>
	);
}
