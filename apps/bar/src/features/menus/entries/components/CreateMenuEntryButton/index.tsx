"use client";

import type { RecipeWithLines } from "@/db/schema/recipes";
import { useCreateMenuEntry } from "@/features/menus/entries/stores/createMenuEntry";
import { Button, type ButtonProps } from "@/ui/Button";

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
