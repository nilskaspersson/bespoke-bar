"use client";

import type { Menu } from "@/db/schema/menus";
import { ClearFeaturedMenuButton } from "@/features/menus/actions/components/ClearFeaturedMenuButton";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { ConfirmAction } from "@/ui/ConfirmAction";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { Text } from "@/ui/Text";
import { ToastActions, toast } from "@/ui/Toast";

export function SetFeaturedMenuButton({
	menu,
	hasFeaturedMenu,
	actionSetFeatured,
	actionClearFeatured,
	requireConfirmation = false,
	children,
	...buttonProps
}: {
	menu: Menu;
	hasFeaturedMenu?: boolean;
	actionSetFeatured: (menuId: string) => Promise<unknown>;
	actionClearFeatured: () => Promise<unknown>;
	requireConfirmation?: boolean;
} & ButtonProps) {
	const handleSetFeaturedMenu = async () => {
		const promise = actionSetFeatured(menu.id);

		const toastId = Date.now().toString();

		toast.promise(promise, {
			id: toastId,
			loading: "Submitting…",
			success: () => ({
				message: "Menu set as Featured Menu",
				description:
					"This menu is now the Featured Menu on the front page of the bar.",
				action: (
					<ToastActions>
						<ClearFeaturedMenuButton
							menu={menu}
							actionClearFeatured={actionClearFeatured}
							actionSetFeatured={actionSetFeatured}
							variant="ghost"
							color="red"
							size="tiny"
							onClick={() => toast.dismiss(toastId)}
						>
							Undo
						</ClearFeaturedMenuButton>

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
				message: "Could not set menu as Featured Menu.",
				description: "Try again later.",
			}),
		});

		await promise;
	};

	if (!requireConfirmation) {
		return (
			<form action={handleSetFeaturedMenu}>
				<SubmitButton {...buttonProps}>{children}</SubmitButton>
			</form>
		);
	}

	return (
		<ConfirmAction
			action={handleSetFeaturedMenu}
			actionLabel="Set as Featured Menu"
			iconName="star"
			buttonProps={{
				...buttonProps,
				color: "amber",
			}}
			description={
				<Text as="p" size={2}>
					You are about to set <em>{menu.name}</em> as the Featured Menu. Do you
					want to continue?
				</Text>
			}
			notice={
				hasFeaturedMenu ? (
					<>
						The current Featured Menu{" "}
						<strong>will no longer be Featured.</strong>
					</>
				) : null
			}
		>
			{children}
		</ConfirmAction>
	);
}
