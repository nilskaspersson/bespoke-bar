"use client";

import type { RecipeList } from "@/db/schema/recipeLists";
import { ClearFeaturedListButton } from "@/features/lists/components/ClearFeaturedListButton";
import { useServerAction } from "@/hooks/useServerAction";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { ConfirmAction } from "@/ui/ConfirmAction";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import { ToastActions, toast } from "@/ui/Toast";
import { mutateSWRRecipeListsCache } from "@/utils/swrCache";

export function SetFeaturedListButton({
	list,
	hasFeaturedList,
	actionSetFeatured,
	actionClearFeatured,
	children,
	...buttonProps
}: {
	list: RecipeList;
	hasFeaturedList?: boolean;
	actionSetFeatured: (listId: string) => Promise<unknown>;
	actionClearFeatured: () => Promise<unknown>;
} & ButtonProps) {
	const { action: setFeaturedList } = useServerAction(
		actionSetFeatured,
		mutateSWRRecipeListsCache,
	);

	const handleSetFeaturedList = async () => {
		const promise = setFeaturedList(list.id);

		const toastId = Date.now().toString();

		toast.promise(promise, {
			id: toastId,
			loading: "Submitting…",
			success: () => ({
				message: "List set as Featured List",
				description:
					"This list is now the Featured List on the front page of the bar.",
			}),
			error: () => ({
				message: "Could not set list as Featured List.",
				description: "Try again later.",
			}),
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
						Remove from Featured
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
		});
	};

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
