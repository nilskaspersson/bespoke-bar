"use client";

import { clsx } from "clsx";
import type { ComponentProps, MouseEvent, RefObject } from "react";
import { Button } from "../Button";
import { Icon } from "../Icon";
import styles from "./styles.module.css";

/**
 * Polyfill backdrop-click dismiss for browsers that don't support the
 * `closedby="any"` attribute. `requestClose()` fires a cancelable `cancel` so
 * consumers can keep a single `onCancel` teardown path.
 *
 * Runs unconditionally: Safari 26.2+ stubs `closedBy` on the prototype without
 * a working implementation, so prototype-based feature detection is
 * unreliable. In browsers that do dismiss natively, the duplicate `cancel` is
 * harmless — consumers' `onCancel` handlers are idempotent.
 */
function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
	if (event.target === event.currentTarget) {
		event.currentTarget.requestClose();
	}
}

function handleCloseClick(event: MouseEvent<HTMLButtonElement>) {
	event.currentTarget.closest("dialog")?.requestClose();
}

export function Dialog({
	children,
	className,
	isOpen = false,
	withBlur = true,
	withCloseButton = true,
	ref,
	...props
}: Omit<ComponentProps<"dialog">, "ref"> & {
	isOpen?: boolean;
	withBlur?: boolean;
	withCloseButton?: boolean;
	onClose?: () => void;
	ref?: RefObject<HTMLDialogElement | null>;
}) {
	/**
	 * Always render the dialog node to have a stable ref to toggle
	 */
	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: ESC → native `cancel` event already handles keyboard dismiss for modal dialogs.
		<dialog
			ref={ref}
			closedby="any"
			onClick={handleBackdropClick}
			className={clsx(className, styles.dialog, { [styles.blur]: withBlur })}
			{...props}
		>
			{isOpen ? children : null}

			{isOpen && withCloseButton ? (
				<Button
					className={styles.close}
					onClick={handleCloseClick}
					variant="clear"
					color="light"
					icon
					rounded
					aria-label="Close"
					title="Close"
				>
					<Icon name="xmark" />
				</Button>
			) : null}
		</dialog>
	);
}
