"use client";

import { clsx } from "clsx";
import type { DialogHTMLAttributes, KeyboardEvent, MouseEvent } from "react";
import { handleKey } from "@/utils/handleKey";
import styles from "./styles.module.css";

type DialogEvent =
	| MouseEvent<HTMLDialogElement>
	| KeyboardEvent<HTMLDialogElement>;

export function Dialog({
	children,
	className,
	ref,
	...props
}: DialogHTMLAttributes<HTMLDialogElement> & {
	onClose?: () => void;
	ref: React.RefObject<HTMLDialogElement | null>;
}) {
	const handleClose = (event: DialogEvent) => {
		if (
			event.target instanceof HTMLDialogElement &&
			event.target.nodeName === "DIALOG"
		) {
			event.target.close("dismiss");
		}
	};

	return (
		<dialog
			ref={ref}
			className={clsx(className, styles.dialog)}
			/**
			 * Close on backdrop clicks
			 */
			onClick={handleClose}
			onKeyDown={handleKey([["Escape", handleClose]])}
			{...props}
		>
			{children}
		</dialog>
	);
}
