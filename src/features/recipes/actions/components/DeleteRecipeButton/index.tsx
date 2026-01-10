"use client";

import type { Recipe } from "@/db/schema/recipes";
import { deleteRecipe } from "@/features/recipes/api/deleteRecipe";
import { useServerAction } from "@/hooks/useServerAction";
import type { ButtonProps } from "@/ui/Button";
import { SubmitButton } from "@/ui/SubmitButton";
import { toast } from "@/ui/Toast";
import { errorMessageOrFallback } from "@/utils/api";

export function DeleteRecipeButton({
	recipe,
	children,
	externalToastId,
	...buttonProps
}: {
	recipe: Recipe;
	externalToastId?: string;
} & ButtonProps) {
	const { action: actionDeleteRecipe } = useServerAction(deleteRecipe);

	const handleDelete = async () => {
		const toastId = externalToastId ?? Date.now().toString();

		const promise = actionDeleteRecipe({ id: recipe.id });

		toast.promise(promise, {
			id: toastId,
			loading: "Deleting…",
			success: () => {
				return {
					message: `Deleted "${recipe.name}"`,
				};
			},
			error: (e) => ({
				message: "Could not delete recipe",
				description: errorMessageOrFallback(e, "Try again later."),
			}),
		});
	};

	return (
		<form action={handleDelete}>
			<SubmitButton {...buttonProps}>{children}</SubmitButton>
		</form>
	);
}
