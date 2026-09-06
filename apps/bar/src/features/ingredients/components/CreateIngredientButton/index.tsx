"use client";

import { Button } from "@bespoke/ui/Button";
import { useIngredientEditor } from "@bespoke/ui/stores/ingredientEditor";
import type { ComponentProps } from "react";

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
