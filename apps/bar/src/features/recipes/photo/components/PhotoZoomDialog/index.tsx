"use client";

import { Dialog } from "@bespoke/ui/Dialog";
import type { useDialog } from "@bespoke/ui/hooks/useDialog";
import styles from "./styles.module.css";

export function PhotoZoomDialog({
	dialog,
	src,
}: {
	dialog: ReturnType<typeof useDialog>;
	src: string | null;
}) {
	return (
		<Dialog
			ref={dialog.dialogRef}
			isOpen={dialog.isOpen}
			className={styles.dialog}
		>
			{src ? (
				<img src={src} alt="Your upload" className={styles.image} />
			) : null}
		</Dialog>
	);
}
