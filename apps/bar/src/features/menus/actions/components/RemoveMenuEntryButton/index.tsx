"use client";

import type {
	MenuEntry,
	MenuEntryFormData,
} from "@bespoke/schema/schema/menuEntries";
import { type ButtonProps, LinkButton } from "@bespoke/ui/Button";
import { Icon } from "@bespoke/ui/Icon";
import { SubmitButton } from "@bespoke/ui/SubmitButton";
import { ToastActions, toast } from "@bespoke/ui/Toast";
import { UndoRemoveMenuEntryButton } from "@/features/menus/actions/components/UndoRemoveMenuEntryButton";

export function RemoveMenuEntryButton({
	entry,
	actionRemove,
	actionAdd,
	children,
	...buttonProps
}: {
	entry: MenuEntry;
	actionRemove: (entryId: string) => Promise<MenuEntry>;
	actionAdd?: (userInput: MenuEntryFormData) => Promise<MenuEntry>;
} & ButtonProps) {
	const handleRemove = async () => {
		const toastId = Date.now().toString();

		const promise = actionRemove(entry.id);

		toast.promise(promise, {
			id: toastId,
			loading: "Removing…",
			success: (result) => ({
				message: "Recipe removed from menu",
				action: result ? (
					<ToastActions>
						{typeof actionAdd === "function" ? (
							<UndoRemoveMenuEntryButton
								entry={result}
								actionAdd={actionAdd}
								variant="ghost"
								color="red"
								size="tiny"
								key="undo-remove-entry"
								onClick={() => toast.dismiss(toastId)}
							>
								Undo
							</UndoRemoveMenuEntryButton>
						) : null}

						<LinkButton
							size="tiny"
							href={`/bar/menus/${result.menuId}`}
							variant="ghost"
							color="accent"
							prefetch={false}
							onClick={() => toast.dismiss(toastId)}
						>
							View menu
							<Icon name="angles-right" size={0} />
						</LinkButton>

						<LinkButton
							size="tiny"
							href={`/bar/recipes/${result.recipeId}`}
							variant="ghost"
							color="accent"
							prefetch={false}
							onClick={() => toast.dismiss(toastId)}
						>
							View recipe
							<Icon name="angles-right" size={0} />
						</LinkButton>
					</ToastActions>
				) : null,
			}),
			error: () => "Could not remove recipe from menu. Try again later.",
		});

		await promise;
	};

	return (
		<form action={handleRemove}>
			<SubmitButton {...buttonProps}>{children}</SubmitButton>
		</form>
	);
}
