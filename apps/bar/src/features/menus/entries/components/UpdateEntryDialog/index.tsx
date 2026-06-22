"use client";

import type { MenuEntryWithRecipe } from "@bespoke/schema/schema/menuEntries";
import { Button, type ButtonProps } from "@bespoke/ui/Button";
import { Drawer } from "@bespoke/ui/Drawer";
import { Heading } from "@bespoke/ui/Heading";
import { HGroup } from "@bespoke/ui/HGroup";
import { useDialog } from "@bespoke/ui/hooks/useDialog";
import { Kbd } from "@bespoke/ui/Kbd";
import { SubmitButton } from "@bespoke/ui/SubmitButton";
import dynamic from "next/dynamic";
import { UpdateEntryFormSkeleton } from "@/features/menus/entries/components/UpdateEntryForm";

const UpdateEntryForm = dynamic(
	() =>
		import("@/features/menus/entries/components/UpdateEntryForm").then(
			(m) => m.UpdateEntryForm,
		),
	{
		loading: UpdateEntryFormSkeleton,
		ssr: false,
	},
);

type Props = {
	entry: MenuEntryWithRecipe;
};

export function UpdateEntryDialog({
	entry,
	children,
	...props
}: ButtonProps & Props) {
	const { dialogRef, isOpen, mounted, showModal, closeModal, unmount } =
		useDialog();

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
					<HGroup overline="Update sales price" floatingOverline>
						<Heading level="h3" size={6}>
							{entry.recipe.name}
						</Heading>
					</HGroup>
				}
				actions={
					<li>
						<SubmitButton
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
							Save
						</SubmitButton>
					</li>
				}
			>
				<UpdateEntryForm entry={entry} onSuccess={closeModal} />
			</Drawer>
		</>
	);
}
