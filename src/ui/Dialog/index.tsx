"use client";

import { clsx } from "clsx";
import type { DialogHTMLAttributes } from "react";
import styles from "./styles.module.css";

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
			onClick={({ target: dialog }) => {
				if (
					dialog instanceof HTMLDialogElement &&
					dialog.nodeName === "DIALOG"
				) {
					dialog.close("dismiss");
				}
			}}
			onKeyDown={(event) => {
				if (event.key === "Escape") {
					event.preventDefault();
					ref.current?.close();
				}
			}}
			{...props}
		>
			{children}
		</dialog>
	);
}
