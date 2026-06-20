"use client";

import type { ReactNode } from "react";
import type { Recipe } from "@/db/schema/recipes";
import { deleteRecipe } from "@/features/recipes/api/deleteRecipe";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { getRecipeName } from "@/features/recipes/utils";
import type { ButtonProps } from "@/ui/Button";
import { ConfirmAction } from "@/ui/ConfirmAction";
import { SubmitButton } from "@/ui/SubmitButton";
import { Text } from "@/ui/Text";
import { toast } from "@/ui/Toast";
import { errorMessageOrFallback } from "@/utils/api";

type Props = {
	recipe: Recipe;
	buttonProps?: ButtonProps;
	redirectTo?: string;
	onDelete?: () => void;
	confirm?: boolean;
	externalToastId?: string;
	className?: string;
	children?: ReactNode;
};

export function DeleteRecipeButton({
	recipe,
	buttonProps,
	redirectTo,
	onDelete,
	confirm,
	externalToastId,
	className,
	children,
}: Props) {
	const handleDelete = async () => {
		const toastId = externalToastId ?? Date.now().toString();
		const promise = deleteRecipe({ id: recipe.id, redirectTo });

		toast.promise(promise, {
			id: toastId,
			loading: "Deleting…",
			success: () => ({
				message: `Deleted "${getRecipeName(recipe)}"`,
			}),
			error: (e) => ({
				message: "Could not delete recipe",
				description: errorMessageOrFallback(e, "Try again later."),
			}),
		});

		await promise;
		onDelete?.();
	};

	if (confirm) {
		return (
			<ConfirmAction
				action={handleDelete}
				className={className}
				iconName="trash"
				buttonProps={{ ...buttonProps, color: "red" }}
				actionLabel="Delete Recipe"
				notice={
					<>
						This action is <strong>permanent</strong>. It cannot be undone.
					</>
				}
				description={
					<Text as="p" heavy>
						You are about to delete{" "}
						<Text serif italic>
							<RecipeName recipe={recipe} />
						</Text>
						. Do you want to continue?
					</Text>
				}
			>
				{children}
			</ConfirmAction>
		);
	}

	return (
		<form action={handleDelete} className={className}>
			<SubmitButton {...buttonProps}>{children}</SubmitButton>
		</form>
	);
}
