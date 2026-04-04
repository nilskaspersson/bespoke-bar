"use client";

import type { ReactNode } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { useIngredientEditor } from "@/features/ingredients/stores/ingredientEditor";
import type { ButtonProps } from "@/ui/Button";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";

type Props = {
	ingredient: Partial<Ingredient>;
	children?: ReactNode;
	variant?: ButtonProps["variant"];
	size?: ButtonProps["size"];
	color?: ButtonProps["color"];
	className?: string;
};

export function EditIngredientButton({
	ingredient,
	children,
	...props
}: Props) {
	const open = useIngredientEditor((s) => s.open);

	return (
		<Button
			{...props}
			onClick={(event) => {
				event.stopPropagation();
				open(ingredient);
			}}
		>
			<Icon name="pen-to-square" size={1} />
			{children}
		</Button>
	);
}
