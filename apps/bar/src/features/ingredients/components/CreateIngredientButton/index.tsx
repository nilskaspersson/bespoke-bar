"use client";

import type { ComponentProps } from "react";
import { useIngredientEditor } from "@/features/ingredients/stores/ingredientEditor";
import { Button } from "@/ui/Button";

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
