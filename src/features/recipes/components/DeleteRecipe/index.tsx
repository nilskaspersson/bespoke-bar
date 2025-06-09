"use client";

import type { PropsWithChildren } from "react";
import type { Recipe } from "@/db/schema/recipes";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { useConfirmSubmit } from "@/hooks/useConfirmSubmit";
import { Alert } from "@/ui/Alert";
import { Button } from "@/ui/Button";
import { SubmitButton } from "@/ui/SubmitButton";
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
	const {
		isPending,
		confirmSubmit,
		resolveAction,
		rejectAction,
		isSubmitting,
	} = useConfirmSubmit(action);

	return (
		<form className={className} onSubmit={confirmSubmit}>
			<SubmitButton>{children}</SubmitButton>

			{isPending ? (
				<Alert
					onClose={rejectAction}
					heading="Delete Recipe"
					notice={
						<>
							This action is <strong>permanent</strong> and cannot be undone.
						</>
					}
					actions={
						<>
							<Button onClick={rejectAction} autoFocus>
								Cancel
							</Button>

							<Button onClick={resolveAction} disabled={isSubmitting}>
								Delete Recipe
							</Button>
						</>
					}
				>
					<Text as="p">
						You are about to delete{" "}
						<Text italic>
							<RecipeName recipe={recipe} />
						</Text>
						, do you want to continue?
					</Text>
				</Alert>
			) : null}
		</form>
	);
}
