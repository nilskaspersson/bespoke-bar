"use client";

import dynamic from "next/dynamic";
import { useId } from "react";
import type { RecipeList } from "@/db/schema/recipeLists";
import { AddRecipeFormSkeleton } from "@/features/lists/entries/components/AddRecipeForm";
import { useDialog } from "@/hooks/useDialog";
import { Button, type ButtonProps } from "@/ui/Button";
import { Drawer } from "@/ui/Drawer";
import { Heading } from "@/ui/Heading";
import { HGroup } from "@/ui/HGroup";

const AddRecipeForm = dynamic(
	() =>
		import("@/features/lists/entries/components/AddRecipeForm").then(
			(m) => m.AddRecipeForm,
		),
	{
		loading: AddRecipeFormSkeleton,
		ssr: false,
	},
);

type Props = ButtonProps & {
	list: RecipeList;
};

export function AddRecipeDialog({ list, children, ...props }: Props) {
	const { openDialog, closeDialog, dialogRef, isOpen } = useDialog();
	const formId = useId();

	return (
		<>
			<Button {...props} onClick={openDialog}>
				{children}
			</Button>

			{isOpen ? (
				<Drawer
					ref={dialogRef}
					onClose={closeDialog}
					header={
						<HGroup overline="Add recipe to">
							<Heading level="h3" size={6}>
								{list.name}
							</Heading>
						</HGroup>
					}
					actions={
						<li>
							<Button
								type="submit"
								form={formId}
								variant="solid"
								color="accent"
								size="small"
							>
								Add
							</Button>
						</li>
					}
				>
					<AddRecipeForm formId={formId} list={list} onSuccess={closeDialog} />
				</Drawer>
			) : null}
		</>
	);
}
