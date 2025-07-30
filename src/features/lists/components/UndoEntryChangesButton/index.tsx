"use client";

import type { MouseEventHandler } from "react";
import type { RecipeListEntry } from "@/db/schema/recipeListEntries";
import { updateRecipeListEntry } from "@/features/lists/actions/updateRecipeListEntry";
import { Button, type ButtonProps } from "@/ui/Button";
import { toast } from "@/ui/Toast";

export function UndoEntryChangesButton({
	entry,
	onClick,
	children,
	...buttonProps
}: {
	entry: RecipeListEntry;
} & ButtonProps) {
	const handleUndo: MouseEventHandler<HTMLButtonElement> = async (event) => {
		onClick?.(event);

		const promise = updateRecipeListEntry(entry.id, {
			listId: entry.listId,
			price: entry.price,
			sortOrder: entry.sortOrder,
			recipeId: entry.recipeId,
		});

		toast.promise(promise, {
			loading: "Undoing…",
			success: "Changes undone",
			error: "Changes could not be undone",
		});
	};

	return (
		<Button
			variant="ghost"
			color="light"
			size="tiny"
			onClick={handleUndo}
			{...buttonProps}
		>
			{children}
		</Button>
	);
}
