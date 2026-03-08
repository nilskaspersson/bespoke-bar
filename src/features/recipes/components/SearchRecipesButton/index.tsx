"use client";

import { SearchRecipesForm } from "@/features/recipes/components/SearchRecipesForm";
import { useDialog } from "@/hooks/useDialog";
import { Button, type ButtonProps } from "@/ui/Button";
import { Dialog } from "@/ui/Dialog";
import { Kbd } from "@/ui/Kbd";

export function SearchRecipesButton({ children, ...props }: ButtonProps) {
	const { dialogRef, isOpen } = useDialog();

	function toggleDialog() {
		if (dialogRef.current?.open) {
			dialogRef.current.close();
		} else {
			dialogRef.current?.showModal();
		}
	}

	return (
		<>
			<Button
				{...props}
				onClick={() => dialogRef.current?.showModal()}
				endAdornment={<Kbd shortcut="mod+k" onTrigger={toggleDialog} />}
			>
				{children}
			</Button>

			<Dialog ref={dialogRef} isOpen={isOpen}>
				<SearchRecipesForm
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
			</Dialog>
		</>
	);
}
