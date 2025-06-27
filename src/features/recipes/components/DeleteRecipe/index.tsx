"use client";

import type { PropsWithChildren } from "react";
import type { Recipe } from "@/db/schema/recipes";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { ConfirmDelete } from "@/ui/ConfirmDelete";
import { Text } from "@/ui/Text";

export function DeleteRecipe({
	action,
	className,
	children,
	recipe,
}: PropsWithChildren<{
	action: () => Promise<void>;
	className?: string;
	recipe: Recipe;
}>) {
	return (
		<ConfirmDelete
			action={action}
			className={className}
			actionLabel="Delete Recipe"
			notice={
				<>
					This action is <strong>permanent</strong> and cannot be undone.
				</>
			}
			description={
				<Text as="p">
					You are about to delete{" "}
					<i>
						<RecipeName recipe={recipe} />
					</i>
					. Do you want to continue?
				</Text>
			}
		>
			{children}
		</ConfirmDelete>
	);
}
