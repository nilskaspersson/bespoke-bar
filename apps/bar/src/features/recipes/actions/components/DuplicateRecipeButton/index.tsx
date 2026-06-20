"use client";

import type { Recipe, RecipeWithLines } from "@/db/schema/recipes";
import { DeleteRecipeButton } from "@/features/recipes/actions/components/DeleteRecipeButton";
import { duplicateRecipeAction } from "@/features/recipes/api/duplicateRecipe";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { ToastActions, toast } from "@/ui/Toast";
import { errorMessageOrFallback } from "@/utils/api";

export function DuplicateRecipeButton({
	recipe,
	children,
	onSuccess,
	externalToastId,
	...buttonProps
}: {
	recipe: RecipeWithLines;
	onSuccess?: (newRecipe: Recipe) => void;
	externalToastId?: string;
} & ButtonProps) {
	const handleDuplicate = async () => {
		const toastId = externalToastId ?? Date.now().toString();

		const promise = duplicateRecipeAction(recipe.id);

		toast.promise(promise, {
			id: toastId,
			loading: "Duplicating…",
			success: (newRecipe) => {
				if (!newRecipe) {
					return {
						message: "Could not duplicate recipe",
						description: "Try again later.",
					};
				}

				onSuccess?.(newRecipe);

				return {
					message: `Created "${newRecipe.name}"`,
					action: (
						<ToastActions>
							<DeleteRecipeButton
								recipe={newRecipe}
								buttonProps={{
									variant: "ghost",
									size: "tiny",
									color: "red",
									onClick: () => toast.dismiss(toastId),
								}}
							>
								<Icon name="arrow-rotate-left" size={0} /> Undo
							</DeleteRecipeButton>

							<LinkButton
								size="tiny"
								href={`/bar/recipes/${newRecipe.id}`}
								variant="ghost"
								color="heavy"
								prefetch
								onClick={() => toast.dismiss(toastId)}
							>
								View recipe
							</LinkButton>
						</ToastActions>
					),
				};
			},
			error: (e) => ({
				message: "Could not duplicate recipe",
				description: errorMessageOrFallback(e, "Try again later."),
			}),
		});

		await promise;
	};

	return (
		<form action={handleDuplicate}>
			<SubmitButton {...buttonProps}>{children}</SubmitButton>
		</form>
	);
}
