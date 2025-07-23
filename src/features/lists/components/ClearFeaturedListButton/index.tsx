"use client";

import type { RecipeList } from "@/db/schema/recipeLists";
import { SetFeaturedListButton } from "@/features/lists/components/SetFeaturedListButton";
import { useServerAction } from "@/hooks/useServerAction";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { ToastActions, toast } from "@/ui/Toast";

export function ClearFeaturedListButton({
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
	const { action: clearFeaturedList } = useServerAction(actionClearFeatured);

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
		<form action={handleClearFeaturedList}>
			<SubmitButton {...buttonProps}>{children}</SubmitButton>
		</form>
	);
}
