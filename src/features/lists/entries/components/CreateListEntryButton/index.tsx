"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { CreateListEntryFormSkeleton } from "@/features/lists/entries/components/CreateListEntryForm";
import { getRecipeName } from "@/features/recipes/utils";
import { useDialog } from "@/hooks/useDialog";
import { Button, type ButtonProps } from "@/ui/Button";
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

type Props = ButtonProps & {
	recipe: RecipeWithSpecs;
};

export function CreateListEntryButton({ recipe, children, ...props }: Props) {
	const { dialogRef, isOpen, mounted, showModal, closeModal, unmount } =
		useDialog();
	const formRef = useRef<HTMLFormElement>(null);

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
					<HGroup overline={getRecipeName(recipe)}>
						<Heading level="h3" size={6}>
							Add to list
						</Heading>
					</HGroup>
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
				<CreateListEntryForm
					recipe={recipe}
					onSuccess={closeModal}
					formRef={formRef}
				/>
			</Drawer>
		</>
	);
}
