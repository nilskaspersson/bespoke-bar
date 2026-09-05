"use client";

import { Button } from "@bespoke/ui/Button";
import { Drawer } from "@bespoke/ui/Drawer";
import { Heading } from "@bespoke/ui/Heading";
import { HGroup } from "@bespoke/ui/HGroup";
import { useDialog } from "@bespoke/ui/hooks/useDialog";
import { Kbd } from "@bespoke/ui/Kbd";
import {
	ingredientEditorStore,
	useIngredientEditor,
} from "@bespoke/ui/stores/ingredientEditor";
import { useEffect, useId } from "react";
import { useShallow } from "zustand/react/shallow";
import { CreateIngredientDrawerForm } from "@/features/ingredients/components/CreateIngredientDrawerForm";
import { EditIngredientForm } from "@/features/ingredients/components/EditIngredientForm";

export function IngredientEditorDrawer() {
	const formId = useId();
	const { dialogRef, isOpen, mounted, unmount } = useDialog();

	useEffect(() => {
		ingredientEditorStore.dialogRef = dialogRef;
	}, [dialogRef]);

	const { mode, ingredient, pending, clear } = useIngredientEditor(
		useShallow((s) => ({
			mode: s.mode,
			ingredient: s.ingredient,
			pending: s.pending,
			clear: s.clear,
		})),
	);

	const isCreate = mode === "create";

	return (
		<Drawer
			ref={dialogRef}
			isOpen={isOpen}
			mounted={mounted}
			onExitComplete={unmount}
			onClose={clear}
			header={
				<HGroup
					overline={isCreate ? "New ingredient" : "Edit ingredient"}
					floatingOverline
				>
					<Heading level="h3" size={6}>
						{isCreate ? "New ingredient" : (ingredient?.name ?? "Ingredient")}
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
						disabled={pending}
						endAdornment={
							<Kbd
								shortcut="mod+enter"
								variant="ghost"
								ignoreInputEvents={false}
							/>
						}
					>
						Save
					</Button>
				</li>
			}
		>
			{isCreate ? (
				<CreateIngredientDrawerForm formId={formId} />
			) : ingredient ? (
				<EditIngredientForm formId={formId} ingredient={ingredient} />
			) : null}
		</Drawer>
	);
}
