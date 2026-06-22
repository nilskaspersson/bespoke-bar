"use client";

import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { Button, type ButtonProps } from "@bespoke/ui/Button";
import { Icon } from "@bespoke/ui/Icon";
import { useIngredientEditor } from "@/features/ingredients/stores/ingredientEditor";

type Props = {
	ingredient: Partial<Ingredient>;
} & ButtonProps;

export function EditIngredientButton({
	ingredient,
	children,
	onClick,
	...props
}: Props) {
	const open = useIngredientEditor((s) => s.open);

	return (
		<Button
			{...props}
			onClick={(event) => {
				onClick?.(event);
				event.stopPropagation();
				open(ingredient);
			}}
			endAdornment={<Icon name="pen-to-square" size={1} />}
		>
			{children}
		</Button>
	);
}
