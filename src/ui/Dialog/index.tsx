"use client";

import { clsx } from "clsx";
import type { DialogHTMLAttributes, KeyboardEvent, MouseEvent } from "react";
import { handleKey } from "@/utils/handleKey";
import styles from "./styles.module.css";

type DialogEvent =
	| MouseEvent<HTMLDialogElement>
	| KeyboardEvent<HTMLDialogElement>;

const handleClickClose = (event: DialogEvent) => {
	if (
		event.target instanceof HTMLDialogElement &&
		event.target.nodeName === "DIALOG"
	) {
		event.target.close("dismiss");
	}
};

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
	ref,
	...props
}: DialogHTMLAttributes<HTMLDialogElement> & {
	onClose?: () => void;
	ref: React.RefObject<HTMLDialogElement | null>;
}) {
	return (
		<dialog
			ref={ref}
			className={clsx(className, styles.dialog)}
			/**
			 * Close on backdrop clicks
			 */
			onClick={handleClickClose}
			onKeyDown={handleKey([["Escape", handleKeyboardClose]])}
			{...props}
		>
			{children}
		</dialog>
	);
}
