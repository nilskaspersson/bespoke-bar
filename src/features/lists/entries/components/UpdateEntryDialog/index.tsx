"use client";

import dynamic from "next/dynamic";
import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";
import { UpdateEntryFormSkeleton } from "@/features/lists/entries/components/UpdateEntryForm";
import { useDialog } from "@/hooks/useDialog";
import { Button, type ButtonProps } from "@/ui/Button";
import type { DrawerHandle } from "@/ui/Drawer";
import { Drawer } from "@/ui/Drawer";
import { Heading } from "@/ui/Heading";
import { HGroup } from "@/ui/HGroup";
import { SubmitButton } from "@/ui/SubmitButton";

const UpdateEntryForm = dynamic(
	() =>
		import("@/features/lists/entries/components/UpdateEntryForm").then(
			(m) => m.UpdateEntryForm,
		),
	{
		loading: UpdateEntryFormSkeleton,
		ssr: false,
	},
);

type Props = {
	entry: RecipeListEntryWithRecipe;
};

export function UpdateEntryDialog({
	entry,
	children,
	...props
}: ButtonProps & Props) {
	const { openDialog, closeDialog, dialogRef, isOpen } =
		useDialog<DrawerHandle>();

	return (
		<>
			<Button {...props} onClick={openDialog}>
				{children}
			</Button>

			<Drawer
				ref={dialogRef}
				onClose={closeDialog}
				header={
					<HGroup overline="Update sales price">
						<Heading level="h3" size={6}>
							{entry.recipe.name}
						</Heading>
					</HGroup>
				}
				actions={
					<li>
						<SubmitButton variant="solid" color="accent" size="small">
							Save
						</SubmitButton>
					</li>
				}
			>
				{isOpen ? (
					<UpdateEntryForm entry={entry} onSuccess={closeDialog} />
				) : null}
			</Drawer>
		</>
	);
}
