"use client";

import type { Menu } from "@bespoke/schema/schema/menus";
import { Button, type ButtonProps } from "@bespoke/ui/Button";
import { Drawer } from "@bespoke/ui/Drawer";
import { Heading } from "@bespoke/ui/Heading";
import { HGroup } from "@bespoke/ui/HGroup";
import { useDialog } from "@bespoke/ui/hooks/useDialog";
import { Kbd } from "@bespoke/ui/Kbd";
import dynamic from "next/dynamic";
import { useId } from "react";
import { AddRecipeFormSkeleton } from "@/features/menus/entries/components/AddRecipeForm";

const AddRecipeForm = dynamic(
	() =>
		import("@/features/menus/entries/components/AddRecipeForm").then(
			(m) => m.AddRecipeForm,
		),
	{
		loading: AddRecipeFormSkeleton,
		ssr: false,
	},
);

type Props = ButtonProps & {
	menu: Menu;
};

export function AddRecipeDialog({ menu, children, ...props }: Props) {
	const { dialogRef, isOpen, mounted, showModal, closeModal, unmount } =
		useDialog();
	const formId = useId();

	return (
		<>
			<Button {...props} onClick={showModal}>
				{children}
			</Button>

			<Drawer
				ref={dialogRef}
				isOpen={isOpen}
				mounted={mounted}
				onExitComplete={unmount}
				header={
					<HGroup overline="Add recipe to" floatingOverline>
						<Heading level="h3" size={6}>
							{menu.name}
						</Heading>
					</HGroup>
				}
				actions={
					<li>
						<Button
							type="submit"
							form={formId}
							variant="solid"
							color="accent"
							size="small"
							endAdornment={
								<Kbd
									shortcut="mod+enter"
									variant="ghost"
									ignoreInputEvents={false}
								/>
							}
						>
							Add
						</Button>
					</li>
				}
			>
				<AddRecipeForm formId={formId} menu={menu} onSuccess={closeModal} />
			</Drawer>
		</>
	);
}
