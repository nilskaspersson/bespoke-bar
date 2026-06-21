"use client";

import type {
	MenuEntry,
	MenuEntryFormData,
} from "@bespoke/schema/schema/menuEntries";
import { RemoveMenuEntryButton } from "@/features/menus/actions/components/RemoveMenuEntryButton";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { ToastActions, toast } from "@/ui/Toast";

export function UndoRemoveMenuEntryButton({
	actionAdd,
	actionRemove,
	children,
	entry,
	...buttonProps
}: {
	entry: MenuEntryFormData;
	actionRemove?: (entryId: string) => Promise<MenuEntry>;
	actionAdd: (userInput: MenuEntryFormData) => Promise<MenuEntry>;
} & ButtonProps) {
	const handleAdd = async () => {
		const toastId = Date.now().toString();

		const promise = actionAdd(entry);

		toast.promise(promise, {
			id: toastId,
			loading: "Restoring…",
			success: (result) => ({
				message: "Recipe restored to menu",
				action: result ? (
					<ToastActions>
						{typeof actionRemove === "function" ? (
							<RemoveMenuEntryButton
								entry={result}
								actionAdd={actionAdd}
								actionRemove={actionRemove}
								variant="ghost"
								color="red"
								size="tiny"
								key="undo-add-entry"
								onClick={() => toast.dismiss(toastId)}
							>
								Undo
							</RemoveMenuEntryButton>
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
			error: (error) => ({
				message:
					error instanceof Error
						? error.message
						: "Recipe could not be added to menu.",
			}),
		});

		await promise;
	};

	return (
		<form action={handleAdd}>
			<SubmitButton {...buttonProps}>{children}</SubmitButton>
		</form>
	);
}
