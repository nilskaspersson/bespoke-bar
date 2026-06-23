"use client";

import type { Menu } from "@bespoke/schema/schema/menus";
import { type ButtonProps, LinkButton } from "@bespoke/ui/Button";
import { ConfirmAction } from "@bespoke/ui/ConfirmAction";
import { Icon } from "@bespoke/ui/Icon";
import { SubmitButton } from "@bespoke/ui/SubmitButton";
import { Text } from "@bespoke/ui/Text";
import { ToastActions, toast } from "@bespoke/ui/Toast";
import { ClearFeaturedMenuButton } from "@/features/menus/actions/components/ClearFeaturedMenuButton";
import { createPromiseToast } from "@/utils/createPromiseToast";

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

		await createPromiseToast(promise, {
			toastId,
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
							href="/"
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
			error: {
				message: "Could not set menu as Featured Menu.",
				description: "Try again later.",
			},
		});
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
