"use client";

import dynamic from "next/dynamic";
import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";
import { UpdateEntryFormSkeleton } from "@/features/lists/entries/components/UpdateEntryForm";
import { useDialog } from "@/hooks/useDialog";
import { Button, type ButtonProps } from "@/ui/Button";
import { Drawer } from "@/ui/Drawer";
import { Heading } from "@/ui/Heading";
import { HGroup } from "@/ui/HGroup";
import { Kbd } from "@/ui/Kbd";
import { SubmitButton } from "@/ui/SubmitButton";

const UpdateEntryForm = dynamic(
	() =>
		import("@/features/lists/entries/components/UpdateEntryForm").then(
			(m) => m.UpdateEntryForm,
		),
	{
		loading: UpdateEntryFormSkeleton,
		ssr: false,
	},
);

type Props = {
	entry: RecipeListEntryWithRecipe;
};

export function UpdateEntryDialog({
	entry,
	children,
	...props
}: ButtonProps & Props) {
	const { dialogRef, isOpen, mounted, unmount } = useDialog();

	return (
		<>
			<Button {...props} onClick={() => dialogRef.current?.showModal()}>
				{children}
			</Button>

			<Drawer
				ref={dialogRef}
				isOpen={isOpen}
				mounted={mounted}
				onExitComplete={unmount}
				header={
					<HGroup overline="Update sales price">
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
				<UpdateEntryForm
					entry={entry}
					onSuccess={() => dialogRef.current?.close()}
				/>
			</Drawer>
		</>
	);
}
