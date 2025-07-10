"use client";

import type { PropsWithChildren } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import type { ButtonProps } from "@/ui/Button";
import { ConfirmDelete } from "@/ui/ConfirmDelete";
import { Text } from "@/ui/Text";

export function DeleteIngredient({
	action,
	children,
	ingredient,
	disabledReason,
	...props
}: PropsWithChildren<{
	action: () => Promise<void>;
	ingredient: Ingredient;
	disabledReason?: React.ReactNode;
}> &
	ButtonProps) {
	return (
		<ConfirmDelete
			{...props}
			action={action}
			actionLabel="Delete Ingredient"
			description={
				<Text as="p">
					You are about to delete <i>{ingredient.name}</i>. Do you want to
					continue?
				</Text>
			}
			notice={
				disabledReason ?? (
					<>
						This action is <strong>permanent</strong>. It cannot be undone.
					</>
				)
			}
		>
			{children}
		</ConfirmDelete>
	);
}
