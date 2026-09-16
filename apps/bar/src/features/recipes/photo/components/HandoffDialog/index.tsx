"use client";

import { Dialog } from "@bespoke/ui/Dialog";
import type { useDialog } from "@bespoke/ui/hooks/useDialog";
import type { ComponentProps } from "react";
import { HandoffContentLoader } from "./loader";
import styles from "./styles.module.css";

/**
 * Always-mounted shell so the opener can call `showModal` directly; the
 * content (and its chunk) only mounts while open.
 */
export function HandoffDialog({
	dialog,
	...content
}: {
	dialog: ReturnType<typeof useDialog>;
} & ComponentProps<typeof HandoffContentLoader>) {
	return (
		<Dialog
			ref={dialog.dialogRef}
			isOpen={dialog.isOpen}
			className={styles.dialog}
		>
			<HandoffContentLoader {...content} />
		</Dialog>
	);
}
