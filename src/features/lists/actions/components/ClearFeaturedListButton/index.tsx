"use client";

import type { RecipeList } from "@/db/schema/recipeLists";
import { SetFeaturedListButton } from "@/features/lists/actions/components/SetFeaturedListButton";
import { trpc } from "@/trpc/client";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { ConfirmAction } from "@/ui/ConfirmAction";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { Text } from "@/ui/Text";
import { ToastActions, toast } from "@/ui/Toast";

export function ClearFeaturedListButton({
	list,
	actionSetFeatured,
	actionClearFeatured,
	requireConfirmation = false,
	children,
	...buttonProps
}: {
	list: RecipeList;
	actionSetFeatured: (listId: string) => Promise<unknown>;
	actionClearFeatured: () => Promise<unknown>;
	requireConfirmation?: boolean;
} & ButtonProps) {
	const utils = trpc.useUtils();

	const handleClearFeaturedList = async () => {
		const promise = actionClearFeatured();

		const toastId = Date.now().toString();

		toast.promise(promise, {
			id: toastId,
			loading: "Submitting…",
			success: () => ({
				message: "This list is no longer the Featured List.",
				action: (
					<ToastActions>
						<SetFeaturedListButton
							list={list}
							actionSetFeatured={actionSetFeatured}
							actionClearFeatured={actionClearFeatured}
							variant="ghost"
							color="red"
							size="tiny"
							onClick={() => toast.dismiss(toastId)}
						>
							Undo
						</SetFeaturedListButton>

						<LinkButton
							size="tiny"
							href="/bar/lists"
							variant="ghost"
							color="heavy"
							prefetch={false}
							onClick={() => toast.dismiss(toastId)}
						>
							View all lists
							<Icon name="angles-right" size={0} />
						</LinkButton>
					</ToastActions>
				),
			}),
			error: () => ({
				message: "Could not clear Featured List.",
				description: "Try again later.",
			}),
		});

		await promise;
		utils.recipeList.list.invalidate();
	};

	if (!requireConfirmation) {
		return (
			<form action={handleClearFeaturedList}>
				<SubmitButton {...buttonProps}>{children}</SubmitButton>
			</form>
		);
	}

	return (
		<ConfirmAction
			action={handleClearFeaturedList}
			actionLabel="Clear Featured List"
			iconName="circle-xmark"
			buttonProps={{
				...buttonProps,
				color: "amber",
			}}
			description={
				<Text as="p" size={2}>
					You are about to clear <em>{list.name}</em> as the Featured List. Do
					you want to continue?
				</Text>
			}
			notice={
				<>
					This list <strong>will no longer be Featured.</strong>
				</>
			}
		>
			{children}
		</ConfirmAction>
	);
}
