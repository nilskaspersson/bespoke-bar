import { useCallback, useRef } from "react";

/**
 * Will I ever use this?
 * When this is sufficient, command + commandfor should also be sufficient?
 * Maybe if callbacks are needed? But then just a ref and request close works
 */
export function useDialog() {
	const dialogRef = useRef<HTMLDialogElement>(null);

	const openDialog = useCallback(() => {
		dialogRef.current?.showModal();
	}, []);

	const closeDialog = useCallback(() => {
		dialogRef.current?.close();
	}, []);

	const toggleDialog = useCallback(() => {
		const dialog = dialogRef.current;
		if (dialog?.open) {
			dialog.close();
		} else {
			dialog?.showModal();
		}
	}, []);

	return { dialogRef, openDialog, closeDialog, toggleDialog };
}
