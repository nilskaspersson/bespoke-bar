"use client";

import type {
	RecipeListEntry,
	RecipeListEntryFormData,
} from "@/db/schema/recipeListEntries";
import { AddListEntryButton } from "@/features/lists/components/AddListEntryButton";
import { useServerAction } from "@/hooks/useServerAction";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { ToastActions, toast } from "@/ui/Toast";

export function RemoveListEntryButton({
	entry,
	actionRemove,
	actionAdd,
	children,
	...buttonProps
}: {
	entry: RecipeListEntry;
	actionRemove: (entryId: string) => Promise<RecipeListEntry>;
	actionAdd?: (userInput: RecipeListEntryFormData) => Promise<RecipeListEntry>;
} & ButtonProps) {
	const { action: removeRecipe } = useServerAction(actionRemove);

	const handleRemove = async () => {
		const promise = removeRecipe(entry.id);
		const toastId = Date.now().toString();

		toast.promise(promise, {
			id: toastId,
			loading: "Removing…",
			success: (result) => ({
				message: "Recipe removed from list",
				action: (
					<ToastActions>
						{typeof actionAdd === "function" ? (
							<AddListEntryButton
								entry={result}
								actionAdd={actionAdd}
								variant="ghost"
								color="red"
								size="tiny"
								key="undo-remove-entry"
								onClick={() => toast.dismiss(toastId)}
							>
								Undo
							</AddListEntryButton>
						) : null}

						<LinkButton
							size="tiny"
							href={`/bar/lists/${result.listId}`}
							variant="ghost"
							color="accent"
							prefetch={false}
							onClick={() => toast.dismiss(toastId)}
						>
							View list
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
				),
			}),
			error: () => "Could not remove recipe from list. Try again later.",
		});
	};

	return (
		<form action={handleRemove}>
			<SubmitButton {...buttonProps}>{children}</SubmitButton>
		</form>
	);
}
