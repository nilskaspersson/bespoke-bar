"use client";

import { clsx } from "clsx";
import type { DialogHTMLAttributes } from "react";
import styles from "./styles.module.css";

export function Dialog({
	children,
	className,
	isOpen = false,
	ref,
	...props
}: DialogHTMLAttributes<HTMLDialogElement> & {
	isOpen?: boolean;
	onClose?: () => void;
	ref: React.RefObject<HTMLDialogElement | null>;
}) {
	/**
	 * Always render the dialog node to have a stable ref to toggle
	 */
	return (
		<dialog
			ref={ref}
			closedby="any"
			className={clsx(className, styles.dialog)}
			{...props}
		>
			{isOpen ? children : null}
		</dialog>
	);
}
