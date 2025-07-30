"use client";

import type { ReactNode } from "react";
import { ModalContext, useModal } from "@/hooks/useModal";
import { Button, type ButtonProps } from "@/ui/Button";

export function ToggleModalButton({
	children,
	label,
	...buttonProps
}: Omit<ButtonProps, "children" | "onClick"> & {
	label: ReactNode;
	children: ReactNode;
}) {
	const modal = useModal();

	return (
		<>
			<Button {...buttonProps} onClick={modal.handleOpen}>
				{label}
			</Button>

			{modal.isOpen ? (
				<ModalContext.Provider value={modal}>{children}</ModalContext.Provider>
			) : null}
		</>
	);
}
