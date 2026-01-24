"use client";

import { useRef } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { CreateListEntryForm } from "@/features/lists/entries/components/CreateListEntryForm";
import { getRecipeName } from "@/features/recipes/utils";
import { useDialog } from "@/hooks/useDialog";
import { Button, type ButtonProps } from "@/ui/Button";
import { Drawer } from "@/ui/Drawer";
import { Heading } from "@/ui/Heading";
import { HGroup } from "@/ui/HGroup";
import { SubmitButton } from "@/ui/SubmitButton";

type Props = ButtonProps & {
	recipe: RecipeWithSpecs;
};

export function CreateListEntryButton({ recipe, children, ...props }: Props) {
	const { openDialog, closeDialog, onClose, dialogRef, isOpen } = useDialog();
	const formRef = useRef<HTMLFormElement>(null);

	const handleSubmit = () => {
		formRef.current?.requestSubmit();
	};

	return (
		<>
			<Button {...props} onClick={openDialog}>
				{children}
			</Button>

			<Drawer
				ref={dialogRef}
				onClose={onClose}
				header={
					<HGroup overline={getRecipeName(recipe)}>
						<Heading level="h3" size={6}>
							Add to list
						</Heading>
					</HGroup>
				}
				actions={
					<li>
						<SubmitButton
							variant="solid"
							color="accent"
							size="small"
							onClick={handleSubmit}
						>
							Add
						</SubmitButton>
					</li>
				}
			>
				{isOpen ? (
					<CreateListEntryForm
						recipe={recipe}
						onSuccess={closeDialog}
						formRef={formRef}
					/>
				) : null}
			</Drawer>
		</>
	);
}
