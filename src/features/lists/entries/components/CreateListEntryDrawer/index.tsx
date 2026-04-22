"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { CreateListEntryFormSkeleton } from "@/features/lists/entries/components/CreateListEntryForm";
import {
	createListEntryStore,
	useCreateListEntry,
} from "@/features/lists/entries/stores/createListEntry";
import { getRecipeName } from "@/features/recipes/utils";
import { useDialog } from "@/hooks/useDialog";
import { Drawer } from "@/ui/Drawer";
import { Heading } from "@/ui/Heading";
import { HGroup } from "@/ui/HGroup";
import { Kbd } from "@/ui/Kbd";
import { SubmitButton } from "@/ui/SubmitButton";

const CreateListEntryForm = dynamic(
	() =>
		import("@/features/lists/entries/components/CreateListEntryForm").then(
			(m) => m.CreateListEntryForm,
		),
	{
		loading: CreateListEntryFormSkeleton,
		ssr: false,
	},
);

export function CreateListEntryDrawer() {
	const { dialogRef, isOpen, mounted, closeModal, unmount } = useDialog();
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		createListEntryStore.dialogRef = dialogRef;
	}, [dialogRef]);

	const { recipe, clear } = useCreateListEntry(
		useShallow((s) => ({
			recipe: s.recipe,
			clear: s.clear,
		})),
	);

	return (
		<Drawer
			ref={dialogRef}
			isOpen={isOpen}
			mounted={mounted}
			onExitComplete={unmount}
			onClose={clear}
			header={
				recipe ? (
					<HGroup overline={getRecipeName(recipe)}>
						<Heading level="h3" size={6}>
							Add to list
						</Heading>
					</HGroup>
				) : null
			}
			actions={
				<li>
					<SubmitButton
						variant="solid"
						color="accent"
						size="small"
						onClick={() => formRef.current?.requestSubmit()}
						endAdornment={
							<Kbd
								shortcut="mod+enter"
								variant="ghost"
								ignoreInputEvents={false}
							/>
						}
					>
						Add
					</SubmitButton>
				</li>
			}
		>
			{recipe ? (
				<CreateListEntryForm
					recipe={recipe}
					onSuccess={closeModal}
					formRef={formRef}
				/>
			) : null}
		</Drawer>
	);
}
