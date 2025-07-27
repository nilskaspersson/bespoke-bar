"use client";

import type { PropsWithChildren } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import type { ButtonProps } from "@/ui/Button";
import { ConfirmAction } from "@/ui/ConfirmAction";
import { Text } from "@/ui/Text";

export function DeleteIngredient({
	action,
	children,
	className,
	ingredient,
	notice,
	...props
}: PropsWithChildren<{
	action: () => Promise<void>;
	ingredient: Ingredient;
	notice?: React.ReactNode;
}> &
	ButtonProps) {
	return (
		<ConfirmAction
			className={className}
			action={action}
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
