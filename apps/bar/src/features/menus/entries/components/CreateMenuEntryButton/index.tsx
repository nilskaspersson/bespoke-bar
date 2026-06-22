"use client";

import type { RecipeWithLines } from "@bespoke/schema/schema/recipes";
import { Button, type ButtonProps } from "@bespoke/ui/Button";
import { useCreateMenuEntry } from "@/features/menus/entries/stores/createMenuEntry";

type Props = ButtonProps & {
	recipe: RecipeWithLines;
};

export function CreateMenuEntryButton({ recipe, children, ...props }: Props) {
	const open = useCreateMenuEntry((s) => s.open);

	return (
		<Button {...props} onClick={() => open(recipe)}>
			{children}
		</Button>
	);
}
