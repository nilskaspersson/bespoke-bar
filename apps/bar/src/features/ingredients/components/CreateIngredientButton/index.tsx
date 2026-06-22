"use client";

import { Button } from "@bespoke/ui/Button";
import type { ComponentProps } from "react";
import { useIngredientEditor } from "@/features/ingredients/stores/ingredientEditor";

export function CreateIngredientButton({
	children,
	onClick,
	...props
}: ComponentProps<typeof Button>) {
	const openCreate = useIngredientEditor((s) => s.openCreate);

	return (
		<Button
			{...props}
			onClick={(event) => {
				onClick?.(event);
				openCreate();
			}}
		>
			{children}
		</Button>
	);
}
