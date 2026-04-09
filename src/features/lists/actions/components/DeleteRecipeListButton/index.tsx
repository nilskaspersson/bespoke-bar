"use client";

import type { PropsWithChildren } from "react";
import type { RecipeListWithEntries } from "@/db/schema/composite";
import { RecipeListFrame } from "@/features/lists/components/RecipeListFrame";
import { trpc } from "@/trpc/client";
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
	...buttonProps
}: PropsWithChildren<{
	action: () => Promise<void>;
	className?: string;
	list: RecipeListWithEntries;
}> &
	ButtonProps) {
	const utils = trpc.useUtils();

	const handleSubmit = async () => {
		const toastId = Date.now().toString();

		const promise = action();

		toast.promise(promise, {
			id: toastId,
			loading: "Deleting list…",
			success: () => "List deleted",
			error: (error) => ({
				message:
					error instanceof Error ? error.message : "List could not be deleted",
			}),
		});

		await promise;
		utils.recipeList.list.invalidate();
	};

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

					<RecipeListFrame list={list} className={styles.card} />
				</Grid>
			}
		>
			{children}
		</ConfirmAction>
	);
}
