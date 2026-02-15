"use client";

import type { ReactNode } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import {
	INGREDIENT_EDITOR_ID,
	useIngredientEditor,
} from "@/features/ingredients/stores/ingredientEditor";
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
	const setIngredient = useIngredientEditor((s) => s.setIngredient);

	return (
		<Button
			{...props}
			onClick={() => setIngredient(ingredient)}
			commandfor={INGREDIENT_EDITOR_ID}
			command="show-modal"
		>
			<Icon name="pen-to-square" size={1} />
			{children}
		</Button>
	);
}
