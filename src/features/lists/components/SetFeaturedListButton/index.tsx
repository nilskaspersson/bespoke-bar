"use client";

import type { RecipeList } from "@/db/schema/recipeLists";
import { ClearFeaturedListButton } from "@/features/lists/components/ClearFeaturedListButton";
import { useServerAction } from "@/hooks/useServerAction";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { ToastActions, toast } from "@/ui/Toast";

export function SetFeaturedListButton({
	list,
	actionSetFeatured,
	actionClearFeatured,
	children,
	...buttonProps
}: {
	list: RecipeList;
	actionSetFeatured: (listId: string) => Promise<void>;
	actionClearFeatured: () => Promise<void>;
} & ButtonProps) {
	const { action: setFeaturedList } = useServerAction(actionSetFeatured);

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
		<form action={handleSetFeaturedList}>
			<SubmitButton {...buttonProps}>{children}</SubmitButton>
		</form>
	);
}
