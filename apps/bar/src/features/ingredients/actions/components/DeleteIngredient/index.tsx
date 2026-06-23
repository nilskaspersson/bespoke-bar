"use client";

import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import type { ButtonProps } from "@bespoke/ui/Button";
import { ConfirmAction } from "@bespoke/ui/ConfirmAction";
import { Text } from "@bespoke/ui/Text";
import type { PropsWithChildren } from "react";
import { deleteIngredient } from "@/features/ingredients/api/deleteIngredient";
import { unwrapAction } from "@/utils/api";
import { createPromiseToast } from "@/utils/createPromiseToast";

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

		await createPromiseToast(promise, {
			loading: "Deleting…",
			success: () => ({ message: `Deleted ${ingredient.name}` }),
			error: {
				message: "Could not delete ingredient",
				description: "Try again later.",
			},
		});
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
