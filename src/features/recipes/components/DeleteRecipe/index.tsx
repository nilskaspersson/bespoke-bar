"use client";

import type { PropsWithChildren } from "react";
import type { Recipe } from "@/db/schema/recipes";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import type { ButtonProps } from "@/ui/Button";
import { ConfirmAction } from "@/ui/ConfirmAction";
import { Text } from "@/ui/Text";

export function DeleteRecipe({
	action,
	className,
	children,
	recipe,
	...buttonProps
}: PropsWithChildren<{
	action: () => Promise<void>;
	className?: string;
	recipe: Recipe;
}> &
	ButtonProps) {
	return (
		<ConfirmAction
			action={action}
			className={className}
			iconName="trash"
			buttonProps={{
				color: "red",
				...buttonProps,
			}}
			actionLabel="Delete Recipe"
			notice={
				<>
					This action is <strong>permanent</strong>. It cannot be undone.
				</>
			}
			description={
				<Text as="p">
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
