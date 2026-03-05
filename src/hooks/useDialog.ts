"use client";

import { createContext, useCallback, useRef, useState } from "react";
import type { DrawerHandle } from "@/ui/Drawer";

type DialogContextValue = {
	dialogRef: React.RefObject<DrawerHandle | null>;
	isOpen: boolean;
	openDialog: () => void;
	closeDialog: () => void;
	onClose: () => void;
	toggleDialog: () => void;
};

export const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog(): DialogContextValue {
	const dialogRef = useRef<DrawerHandle>(null);
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
