"use client";

import { useEffect, useId } from "react";
import { useShallow } from "zustand/react/shallow";
import { CreateIngredientDrawerForm } from "@/features/ingredients/components/CreateIngredientDrawerForm";
import { EditIngredientForm } from "@/features/ingredients/components/EditIngredientForm";
import {
	ingredientEditorStore,
	useIngredientEditor,
} from "@/features/ingredients/stores/ingredientEditor";
import { useDialog } from "@/hooks/useDialog";
import { Button } from "@/ui/Button";
import { Drawer } from "@/ui/Drawer";
import { Heading } from "@/ui/Heading";
import { HGroup } from "@/ui/HGroup";
import { Kbd } from "@/ui/Kbd";

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
