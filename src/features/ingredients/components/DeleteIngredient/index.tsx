"use client";

import type { PropsWithChildren } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { ConfirmDelete } from "@/ui/ConfirmDelete";
import { Text } from "@/ui/Text";

export function DeleteIngredient({
	action,
	className,
	children,
	ingredient,
}: PropsWithChildren<{
	action: () => Promise<void>;
	className?: string;
	ingredient: Ingredient;
}>) {
	return (
		<ConfirmDelete
			action={action}
			className={className}
			actionLabel="Delete Ingredient"
			notice={
				<>
					This action is <strong>permanent</strong> and cannot be undone.
				</>
			}
			description={
				<Text as="p">
					You are about to delete <Text italic>{ingredient.name}</Text>. Do you
					want to continue?
				</Text>
			}
		>
			{children}
		</ConfirmDelete>
	);
}
