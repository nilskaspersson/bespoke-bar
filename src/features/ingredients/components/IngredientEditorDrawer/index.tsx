"use client";

import { useEffect, useId } from "react";
import { useShallow } from "zustand/react/shallow";
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
	const { dialogRef, isOpen } = useDialog();

	useEffect(() => {
		ingredientEditorStore.dialogRef = dialogRef;
	}, [dialogRef]);

	const { ingredient, pending, clear } = useIngredientEditor(
		useShallow((s) => ({
			ingredient: s.ingredient,
			pending: s.pending,
			clear: s.clear,
		})),
	);

	return (
		<Drawer
			ref={dialogRef}
			isOpen={isOpen}
			onClose={clear}
			header={
				<HGroup overline="Edit ingredient">
					<Heading level="h3" size={6}>
						{ingredient?.name ?? "Ingredient"}
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
			{ingredient ? (
				<EditIngredientForm formId={formId} ingredient={ingredient} />
			) : null}
		</Drawer>
	);
}
