"use client";

import type { ReactNode } from "react";
import { DialogContext, useDialog } from "@/hooks/useDialog";
import { Button, type ButtonProps } from "@/ui/Button";

export function ToggleDrawerButton({
	children,
	label,
	...buttonProps
}: Omit<ButtonProps, "children" | "onClick"> & {
	label: ReactNode;
	children: ReactNode;
}) {
	const dialog = useDialog();

	return (
		<>
			<Button {...buttonProps} onClick={dialog.openDialog}>
				{label}
			</Button>

			<DialogContext.Provider value={dialog}>{children}</DialogContext.Provider>
		</>
	);
}
