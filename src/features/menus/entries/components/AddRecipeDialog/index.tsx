"use client";

import dynamic from "next/dynamic";
import { useId } from "react";
import type { Menu } from "@/db/schema/menus";
import { AddRecipeFormSkeleton } from "@/features/menus/entries/components/AddRecipeForm";
import { useDialog } from "@/hooks/useDialog";
import { Button, type ButtonProps } from "@/ui/Button";
import { Drawer } from "@/ui/Drawer";
import { Heading } from "@/ui/Heading";
import { HGroup } from "@/ui/HGroup";
import { Kbd } from "@/ui/Kbd";

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
					<HGroup overline="Add recipe to">
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
