"use client";

import { createContext, useContext, useMemo, useState } from "react";

type ModalContextValue = {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	handleClose: () => void;
	handleOpen: () => void;
};

export const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal(): ModalContextValue {
	const [isOpen, setIsOpen] = useState(false);

	return useMemo(
		() => ({
			isOpen,
			setIsOpen,
			handleClose: () => setIsOpen(false),
			handleOpen: () => setIsOpen(true),
		}),
		[isOpen],
	);
}

export function useModalContext() {
	const context = useContext(ModalContext);

	if (!context) {
		throw new Error("useModalContext must be used within a ModalProvider");
	}

	return context;
}
