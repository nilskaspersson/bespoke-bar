"use client";

import type { Recipe, RecipeWithLines } from "@bespoke/schema/schema/recipes";
import { type ButtonProps, LinkButton } from "@bespoke/ui/Button";
import { Icon } from "@bespoke/ui/Icon";
import { SubmitButton } from "@bespoke/ui/SubmitButton";
import { ToastActions, toast } from "@bespoke/ui/Toast";
import { DeleteRecipeButton } from "@/features/recipes/actions/components/DeleteRecipeButton";
import { duplicateRecipeAction } from "@/features/recipes/api/duplicateRecipe";
import { createPromiseToast } from "@/utils/createPromiseToast";

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

		await createPromiseToast(promise, {
			toastId,
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
								href={`/recipes/${newRecipe.id}`}
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
			error: {
				message: "Could not duplicate recipe",
				description: "Try again later.",
			},
		});
	};

	return (
		<form action={handleDuplicate}>
			<SubmitButton {...buttonProps}>{children}</SubmitButton>
		</form>
	);
}
