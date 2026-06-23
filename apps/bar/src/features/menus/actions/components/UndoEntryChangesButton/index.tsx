"use client";

import type { MenuEntry } from "@bespoke/schema/schema/menuEntries";
import { Button, type ButtonProps } from "@bespoke/ui/Button";
import type { MouseEventHandler } from "react";
import { updateMenuEntry } from "@/features/menus/entries/api/updateMenuEntry";
import { createPromiseToast } from "@/utils/createPromiseToast";

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

		await createPromiseToast(promise, {
			loading: "Undoing…",
			success: "Reverted price change",
			error: {
				message: "Could not revert price change",
				description: "Try again later.",
			},
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
