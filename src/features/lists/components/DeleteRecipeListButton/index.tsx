"use client";

import { type PropsWithChildren, useCallback } from "react";
import type { RecipeList } from "@/db/schema/recipeLists";
import { RecipeListFrame } from "@/features/lists/components/RecipeListFrame";
import { useServerAction } from "@/hooks/useServerAction";
import type { ButtonProps } from "@/ui/Button";
import { ConfirmAction } from "@/ui/ConfirmAction";
import { Grid } from "@/ui/Grid";
import { Text } from "@/ui/Text";
import { toast } from "@/ui/Toast";
import styles from "./styles.module.css";

export function DeleteRecipeListButton({
	action,
	children,
	list,
	recipeCount,
	...buttonProps
}: PropsWithChildren<{
	action: () => Promise<void>;
	className?: string;
	list: RecipeList;
	recipeCount: number;
}> &
	ButtonProps) {
	const { action: deleteList } = useServerAction(action);

	const handleSubmit = useCallback(async () => {
		const promise = deleteList();
		const toastId = Date.now().toString();

		toast.promise(promise, {
			id: toastId,
			loading: "Deleting list…",
			success: () => "List deleted",
			error: (error) => ({
				message:
					error instanceof Error ? error.message : "List could not be deleted",
			}),
		});
	}, [deleteList]);

	return (
		<ConfirmAction
			action={handleSubmit}
			iconName="trash"
			buttonProps={{
				color: "red",
				...buttonProps,
			}}
			actionLabel="Delete List"
			notice={
				<>
					This action is <strong>permanent</strong>. It cannot be undone.
				</>
			}
			description={
				<Grid gap={6} className={styles.content}>
					<Text as="p">
						You are about to delete the list{" "}
						<Text serif italic>
							{list.name}
						</Text>
						.
					</Text>

					<RecipeListFrame
						list={list}
						recipeCount={recipeCount}
						className={styles.card}
					/>
				</Grid>
			}
		>
			{children}
		</ConfirmAction>
	);
}
