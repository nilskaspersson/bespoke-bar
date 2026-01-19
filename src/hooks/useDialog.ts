"use client";

import { useCallback, useRef, useState } from "react";

export function useDialog() {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [isOpen, setIsOpen] = useState(false);

	const openDialog = useCallback(() => {
		dialogRef.current?.showModal();
		setIsOpen(true);
	}, []);

	const closeDialog = useCallback(() => {
		dialogRef.current?.close();
		setIsOpen(false);
	}, []);

	/**
	 * Note: MUST be assigned to the dialog, or native dismissal methods won't update
	 * internal state.
	 */
	const onClose = useCallback(() => {
		setIsOpen(false);
	}, []);

	return {
		dialogRef,
		isOpen,
		openDialog,
		closeDialog,
		onClose,
	};
}
