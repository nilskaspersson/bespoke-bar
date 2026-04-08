"use client";

import type { RecipeList } from "@/db/schema/recipeLists";
import { ClearFeaturedListButton } from "@/features/lists/actions/components/ClearFeaturedListButton";
import { trpc } from "@/trpc/client";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { ConfirmAction } from "@/ui/ConfirmAction";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { Text } from "@/ui/Text";
import { ToastActions, toast } from "@/ui/Toast";

export function SetFeaturedListButton({
	list,
	hasFeaturedList,
	actionSetFeatured,
	actionClearFeatured,
	requireConfirmation = false,
	children,
	...buttonProps
}: {
	list: RecipeList;
	hasFeaturedList?: boolean;
	actionSetFeatured: (listId: string) => Promise<unknown>;
	actionClearFeatured: () => Promise<unknown>;
	requireConfirmation?: boolean;
} & ButtonProps) {
	const utils = trpc.useUtils();

	const handleSetFeaturedList = async () => {
		const promise = actionSetFeatured(list.id);

		const toastId = Date.now().toString();

		toast.promise(promise, {
			id: toastId,
			loading: "Submitting…",
			success: () => ({
				message: "List set as Featured List",
				description:
					"This list is now the Featured List on the front page of the bar.",
				action: (
					<ToastActions>
						<ClearFeaturedListButton
							list={list}
							actionClearFeatured={actionClearFeatured}
							actionSetFeatured={actionSetFeatured}
							variant="ghost"
							color="red"
							size="tiny"
							onClick={() => toast.dismiss(toastId)}
						>
							Undo
						</ClearFeaturedListButton>

						<LinkButton
							size="tiny"
							href="/bar"
							variant="ghost"
							color="heavy"
							prefetch={false}
							onClick={() => toast.dismiss(toastId)}
						>
							View front page
							<Icon name="angles-right" size={0} />
						</LinkButton>
					</ToastActions>
				),
			}),
			error: () => ({
				message: "Could not set list as Featured List.",
				description: "Try again later.",
			}),
		});

		await promise;
		utils.recipeList.list.invalidate();
	};

	if (!requireConfirmation) {
		return (
			<form action={handleSetFeaturedList}>
				<SubmitButton {...buttonProps}>{children}</SubmitButton>
			</form>
		);
	}

	return (
		<ConfirmAction
			action={handleSetFeaturedList}
			actionLabel="Set as Featured List"
			iconName="star"
			buttonProps={{
				...buttonProps,
				color: "amber",
			}}
			description={
				<Text as="p" size={2}>
					You are about to set <em>{list.name}</em> as the Featured List. Do you
					want to continue?
				</Text>
			}
			notice={
				hasFeaturedList ? (
					<>
						The current Featured List{" "}
						<strong>will no longer be Featured.</strong>
					</>
				) : null
			}
		>
			{children}
		</ConfirmAction>
	);
}
