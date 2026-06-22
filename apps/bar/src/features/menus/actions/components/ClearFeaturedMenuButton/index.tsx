"use client";

import type { Menu } from "@bespoke/schema/schema/menus";
import { type ButtonProps, LinkButton } from "@bespoke/ui/Button";
import { ConfirmAction } from "@bespoke/ui/ConfirmAction";
import { Icon } from "@bespoke/ui/Icon";
import { SubmitButton } from "@bespoke/ui/SubmitButton";
import { Text } from "@bespoke/ui/Text";
import { ToastActions, toast } from "@bespoke/ui/Toast";
import { SetFeaturedMenuButton } from "@/features/menus/actions/components/SetFeaturedMenuButton";

export function ClearFeaturedMenuButton({
	menu,
	actionSetFeatured,
	actionClearFeatured,
	requireConfirmation = false,
	children,
	...buttonProps
}: {
	menu: Menu;
	actionSetFeatured: (menuId: string) => Promise<unknown>;
	actionClearFeatured: () => Promise<unknown>;
	requireConfirmation?: boolean;
} & ButtonProps) {
	const handleClearFeaturedMenu = async () => {
		const promise = actionClearFeatured();

		const toastId = Date.now().toString();

		toast.promise(promise, {
			id: toastId,
			loading: "Submitting…",
			success: () => ({
				message: "This menu is no longer the Featured Menu.",
				action: (
					<ToastActions>
						<SetFeaturedMenuButton
							menu={menu}
							actionSetFeatured={actionSetFeatured}
							actionClearFeatured={actionClearFeatured}
							variant="ghost"
							color="red"
							size="tiny"
							onClick={() => toast.dismiss(toastId)}
						>
							Undo
						</SetFeaturedMenuButton>

						<LinkButton
							size="tiny"
							href="/bar/menus"
							variant="ghost"
							color="heavy"
							prefetch={false}
							onClick={() => toast.dismiss(toastId)}
						>
							View all menus
							<Icon name="angles-right" size={0} />
						</LinkButton>
					</ToastActions>
				),
			}),
			error: () => ({
				message: "Could not clear Featured Menu.",
				description: "Try again later.",
			}),
		});

		await promise;
	};

	if (!requireConfirmation) {
		return (
			<form action={handleClearFeaturedMenu}>
				<SubmitButton {...buttonProps}>{children}</SubmitButton>
			</form>
		);
	}

	return (
		<ConfirmAction
			action={handleClearFeaturedMenu}
			actionLabel="Clear Featured Menu"
			iconName="circle-xmark"
			buttonProps={{
				...buttonProps,
				color: "amber",
			}}
			description={
				<Text as="p" size={2}>
					You are about to clear <em>{menu.name}</em> as the Featured Menu. Do
					you want to continue?
				</Text>
			}
			notice={
				<>
					This menu <strong>will no longer be Featured.</strong>
				</>
			}
		>
			{children}
		</ConfirmAction>
	);
}
