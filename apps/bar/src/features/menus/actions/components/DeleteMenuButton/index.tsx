"use client";

import type { MenuWithEntries } from "@bespoke/schema/schema/composite";
import type { ButtonProps } from "@bespoke/ui/Button";
import { ConfirmAction } from "@bespoke/ui/ConfirmAction";
import { Grid } from "@bespoke/ui/Grid";
import { Text } from "@bespoke/ui/Text";
import { toast } from "@bespoke/ui/Toast";
import type { PropsWithChildren } from "react";
import { MenuFrame } from "@/features/menus/components/MenuFrame";
import { trpc } from "@/trpc/client";
import styles from "./styles.module.css";

export function DeleteMenuButton({
	action,
	children,
	menu,
	...buttonProps
}: PropsWithChildren<{
	action: () => Promise<void>;
	className?: string;
	menu: MenuWithEntries;
}> &
	ButtonProps) {
	const utils = trpc.useUtils();

	const handleSubmit = async () => {
		const toastId = Date.now().toString();

		const promise = action();

		toast.promise(promise, {
			id: toastId,
			loading: "Deleting menu…",
			success: () => "Menu deleted",
			error: (error) => ({
				message:
					error instanceof Error ? error.message : "Menu could not be deleted",
			}),
		});

		await promise;
		utils.menu.list.invalidate();
	};

	return (
		<ConfirmAction
			action={handleSubmit}
			iconName="trash"
			buttonProps={{
				color: "red",
				...buttonProps,
			}}
			actionLabel="Delete Menu"
			notice={
				<>
					This action is <strong>permanent</strong>. It cannot be undone.
				</>
			}
			description={
				<Grid gap={6} className={styles.content}>
					<Text as="p">
						You are about to delete the menu{" "}
						<Text serif italic>
							{menu.name}
						</Text>
						.
					</Text>

					<MenuFrame menu={menu} className={styles.card} />
				</Grid>
			}
		>
			{children}
		</ConfirmAction>
	);
}
