"use client";

import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { useCreateListEntry } from "@/features/lists/entries/stores/createListEntry";
import { Button, type ButtonProps } from "@/ui/Button";

type Props = ButtonProps & {
	recipe: RecipeWithSpecs;
};

export function CreateListEntryButton({ recipe, children, ...props }: Props) {
	const open = useCreateListEntry((s) => s.open);

	return (
		<Button {...props} onClick={() => open(recipe)}>
			{children}
		</Button>
	);
}
