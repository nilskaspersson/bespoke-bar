"use client";

import type { RecipeList } from "@/db/schema/recipeLists";
import { SetFeaturedListButton } from "@/features/lists/components/SetFeaturedListButton";
import { useServerAction } from "@/hooks/useServerAction";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { ConfirmAction } from "@/ui/ConfirmAction";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import { ToastActions, toast } from "@/ui/Toast";
import { mutateSWRRecipeListsCache } from "@/utils/swrCache";

export function ClearFeaturedListButton({
	list,
	actionSetFeatured,
	actionClearFeatured,
	children,
	...buttonProps
}: {
	list: RecipeList;
	actionSetFeatured: (listId: string) => Promise<unknown>;
	actionClearFeatured: () => Promise<unknown>;
} & ButtonProps) {
	const { action: clearFeaturedList } = useServerAction(
		actionClearFeatured,
		mutateSWRRecipeListsCache,
	);

	const handleClearFeaturedList = async () => {
		const promise = clearFeaturedList();

		const toastId = Date.now().toString();

		toast.promise(promise, {
			id: toastId,
			loading: "Submitting…",
			success: () => ({
				message: "This list is no longer the Featured List.",
			}),
			error: () => ({
				message: "Could not clear Featured List.",
				description: "Try again later.",
			}),
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
		});
	};

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
