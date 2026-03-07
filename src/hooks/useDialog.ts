"use client";

import { createContext, useCallback, useRef, useState } from "react";

type DialogHandle = {
	showModal: () => void;
	close: () => void;
};

type DialogContextValue<T extends DialogHandle = HTMLDialogElement> = {
	dialogRef: React.RefObject<T | null>;
	isOpen: boolean;
	openDialog: () => void;
	closeDialog: () => void;
	onClose: () => void;
	toggleDialog: () => void;
};

export const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog<
	T extends DialogHandle = HTMLDialogElement,
>(): DialogContextValue<T> {
	const dialogRef = useRef<T>(null);
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

	const toggleDialog = useCallback(() => {
		if (isOpen) {
			closeDialog();
		} else {
			openDialog();
		}
	}, [isOpen, closeDialog, openDialog]);

	return {
		dialogRef,
		isOpen,
		openDialog,
		closeDialog,
		onClose,
		toggleDialog,
	};
}
