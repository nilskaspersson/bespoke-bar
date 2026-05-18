"use client";

import type { MouseEventHandler } from "react";
import type { MenuEntry } from "@/db/schema/menuEntries";
import { updateMenuEntry } from "@/features/menus/entries/api/updateMenuEntry";
import { Button, type ButtonProps } from "@/ui/Button";
import { toast } from "@/ui/Toast";
import { errorMessageOrFallback } from "@/utils/api";

export function UndoEntryChangesButton({
	entry,
	onClick,
	children,
	...buttonProps
}: {
	entry: MenuEntry;
} & ButtonProps) {
	const handleUndo: MouseEventHandler<HTMLButtonElement> = async (event) => {
		onClick?.(event);

		const promise = updateMenuEntry(entry.id, {
			menuId: entry.menuId,
			price: entry.price,
			sortOrder: entry.sortOrder,
			recipeId: entry.recipeId,
		});

		toast.promise(promise, {
			loading: "Undoing…",
			success: "Reverted price change",
			error: (e) => ({
				message: "Could not revert price change",
				description: errorMessageOrFallback(e, "Try again later."),
			}),
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
