"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { CreateMenuEntryFormSkeleton } from "@/features/menus/entries/components/CreateMenuEntryForm";
import {
	createMenuEntryStore,
	useCreateMenuEntry,
} from "@/features/menus/entries/stores/createMenuEntry";
import { useDialog } from "@/hooks/useDialog";
import { Drawer } from "@/ui/Drawer";
import { Heading } from "@/ui/Heading";
import { Kbd } from "@/ui/Kbd";
import { SubmitButton } from "@/ui/SubmitButton";

const CreateMenuEntryForm = dynamic(
	() =>
		import("@/features/menus/entries/components/CreateMenuEntryForm").then(
			(m) => m.CreateMenuEntryForm,
		),
	{
		loading: CreateMenuEntryFormSkeleton,
		ssr: false,
	},
);

export function CreateMenuEntryDrawer() {
	const { dialogRef, isOpen, mounted, closeModal, unmount } = useDialog();
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		createMenuEntryStore.dialogRef = dialogRef;
	}, [dialogRef]);

	const { recipe, clear } = useCreateMenuEntry(
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
					<Heading level="h3" size={6}>
						Add to Menu
					</Heading>
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
				<CreateMenuEntryForm
					recipe={recipe}
					onSuccess={closeModal}
					formRef={formRef}
				/>
			) : null}
		</Drawer>
	);
}
