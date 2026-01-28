"use client";

import { SearchRecipesForm } from "@/features/recipes/components/SearchRecipesForm";
import { useDialog } from "@/hooks/useDialog";
import { Button, type ButtonProps } from "@/ui/Button";
import { Dialog } from "@/ui/Dialog";
import { Kbd } from "@/ui/Kbd";

export function SearchRecipesButton({ children, ...props }: ButtonProps) {
	const { openDialog, onClose, dialogRef, isOpen, closeDialog, toggleDialog } =
		useDialog();

	return (
		<>
			<Button
				{...props}
				onClick={openDialog}
				endAdornment={<Kbd shortcut="mod+k" onTrigger={toggleDialog} />}
			>
				{children}
			</Button>

			<Dialog ref={dialogRef} onClose={onClose}>
				{isOpen ? (
					<SearchRecipesForm
						onNavigate={closeDialog}
						actions={
							<li>
								<form method="dialog">
									<Button type="submit" variant="ghost" size="tiny">
										Cancel
									</Button>
								</form>
							</li>
						}
					/>
				) : null}
			</Dialog>
		</>
	);
}
