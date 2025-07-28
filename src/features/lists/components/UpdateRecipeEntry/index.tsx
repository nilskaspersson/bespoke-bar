"use client";

import { useCallback, useState } from "react";
import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";
import { UpdateRecipeEntryFormDialog } from "@/features/lists/components/UpdateRecipeEntryFormDialog";

import { Button, type ButtonProps } from "@/ui/Button";

type Props = {
	entry: RecipeListEntryWithRecipe;
};

export function UpdateRecipeEntryButton({
	entry,
	children,
	...buttonProps
}: Props & ButtonProps) {
	const [isOpen, setIsOpen] = useState(false);

	const handleClose = useCallback(() => {
		setIsOpen(false);
	}, []);

	return (
		<>
			<Button
				{...buttonProps}
				onClick={() => {
					setIsOpen(true);
				}}
			>
				{children}
			</Button>

			{isOpen ? (
				<UpdateRecipeEntryFormDialog entry={entry} handleClose={handleClose} />
			) : null}
		</>
	);
}
