"use client";

import type {
	RecipeListEntry,
	RecipeListEntryFormData,
} from "@/db/schema/recipeListEntries";
import { RemoveListEntryButton } from "@/features/lists/components/RemoveListEntryButton";
import { useServerAction } from "@/hooks/useServerAction";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { ToastActions, toast } from "@/ui/Toast";

export function AddListEntryButton({
	actionAdd,
	actionRemove,
	children,
	entry,
	...buttonProps
}: {
	entry: RecipeListEntryFormData;
	actionRemove?: (entryId: string) => Promise<RecipeListEntry>;
	actionAdd: (userInput: RecipeListEntryFormData) => Promise<RecipeListEntry>;
} & ButtonProps) {
	const { action: addRecipe } = useServerAction(actionAdd);

	const action = async () => {
		const promise = addRecipe(entry);
		const toastId = Date.now().toString();

		toast.promise(promise, {
			id: toastId,
			loading: "Adding…",
			success: (result) => ({
				message: "Recipe added to list",
				description: "View the list to set sales price and more.",
				action: result ? (
					<ToastActions>
						{typeof actionRemove === "function" ? (
							<RemoveListEntryButton
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
							</RemoveListEntryButton>
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
				) : null,
			}),
			error: () => "Could not remove recipe from list. Try again later.",
		});
	};

	return (
		<form action={action}>
			<SubmitButton {...buttonProps}>{children}</SubmitButton>
		</form>
	);
}
