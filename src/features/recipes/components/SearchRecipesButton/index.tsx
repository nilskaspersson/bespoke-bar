"use client";

import { SearchRecipesForm } from "@/features/recipes/components/SearchRecipesForm";
import styles from "@/features/recipes/components/SearchRecipesForm/styles.module.css";
import { useDialog } from "@/hooks/useDialog";
import { Button, type ButtonProps } from "@/ui/Button";
import { Dialog } from "@/ui/Dialog";
import { Kbd } from "@/ui/Kbd";

export function SearchRecipesButton({ children, ...props }: ButtonProps) {
	const { dialogRef, isOpen, showModal, closeModal } = useDialog();

	function toggleDialog() {
		if (dialogRef.current?.open) {
			closeModal();
		} else {
			showModal();
		}
	}

	return (
		<>
			<Button
				{...props}
				onClick={showModal}
				endAdornment={<Kbd shortcut="mod+k" onTrigger={toggleDialog} />}
			>
				{children}
			</Button>

			<Dialog ref={dialogRef} isOpen={isOpen} className={styles.dialog}>
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
