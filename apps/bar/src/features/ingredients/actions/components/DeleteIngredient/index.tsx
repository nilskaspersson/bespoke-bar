"use client";

import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import type { PropsWithChildren } from "react";
import { deleteIngredient } from "@/features/ingredients/api/deleteIngredient";
import type { ButtonProps } from "@/ui/Button";
import { ConfirmAction } from "@/ui/ConfirmAction";
import { Text } from "@/ui/Text";
import { toast } from "@/ui/Toast";
import { getErrorToast, unwrapAction } from "@/utils/api";

export function DeleteIngredient({
	children,
	className,
	ingredient,
	notice,
	redirectTo,
	...props
}: PropsWithChildren<{
	ingredient: Ingredient;
	notice?: React.ReactNode;
	redirectTo?: string;
}> &
	ButtonProps) {
	async function handleDelete() {
		const promise = unwrapAction(
			deleteIngredient({ id: ingredient.id, redirectTo }),
		);

		toast.promise(promise, {
			loading: "Deleting…",
			success: () => ({ message: `Deleted ${ingredient.name}` }),
			error: (error) =>
				getErrorToast(error, {
					message: "Could not delete ingredient",
					description: "Try again later.",
				}),
		});

		try {
			await promise;
		} catch {
			// Surfaced via the toast above; swallow so it doesn't reach error.tsx.
		}
	}

	return (
		<ConfirmAction
			className={className}
			action={handleDelete}
			actionLabel="Delete Ingredient"
			iconName="trash"
			buttonProps={{
				color: "red",
				...props,
			}}
			description={
				<Text as="p">
					You are about to delete <i>{ingredient.name}</i>. Do you want to
					continue?
				</Text>
			}
			notice={
				notice ?? (
					<>
						This action is <strong>permanent</strong>. It cannot be undone.
					</>
				)
			}
		>
			{children}
		</ConfirmAction>
	);
}
