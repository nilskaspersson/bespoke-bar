"use client";

import type { PropsWithChildren } from "react";
import type { Recipe } from "@/db/schema/recipes";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import type { ButtonProps } from "@/ui/Button";
import { ConfirmAction } from "@/ui/ConfirmAction";
import { Text } from "@/ui/Text";

export function ConfirmDeleteRecipe({
	action,
	className,
	children,
	recipe,
	buttonProps,
}: PropsWithChildren<{
	action: () => Promise<void>;
	className?: string;
	recipe: Recipe;
	buttonProps?: ButtonProps;
}>) {
	return (
		<ConfirmAction
			action={action}
			className={className}
			iconName="trash"
			buttonProps={{
				...buttonProps,
				color: "red",
			}}
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
