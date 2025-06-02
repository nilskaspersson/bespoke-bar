"use client";

import {
	type FormEventHandler,
	useCallback,
	useId,
	useRef,
	useState,
} from "react";
import { type Spec, specsInsertSchema } from "@/db/schema/specs";
import { formatIngredient } from "@/features/ingredients/utils/parseIngredient";
import { Popover } from "@/ui/Popover";
import styles from "./styles.module.css";

export function IngredientPicker({
	onChange,
	ingredient,
}: {
	onChange: (ingredient: Spec["ingredient"] | undefined) => void;
	ingredient: Spec["ingredient"] | undefined;
}) {
	const id = useId();
	const anchorRef = useRef<HTMLButtonElement>(null);
	const [value, setValue] = useState<string>(ingredient ?? "");

	const handleChange = useCallback(
		(ingredient: string) => {
			const formattedIngredient = formatIngredient(ingredient);

			if (formattedIngredient == null) {
				return null;
			}

			onChange(formattedIngredient);
			setValue(formattedIngredient);
		},
		[onChange],
	);

	const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
		(event) => {
			event.preventDefault();
			const formData = new FormData(event.currentTarget);
			const parsedIngredient = specsInsertSchema.shape.ingredient.safeParse(
				formData.get("ingredient"),
			);

			if (parsedIngredient.success) {
				handleChange(parsedIngredient.data);
			} else {
				event.stopPropagation();
			}
		},
		[handleChange],
	);

	if (ingredient == null) {
		return null;
	}

	return (
		<div>
			<button
				type="button"
				popoverTarget={id}
				ref={anchorRef}
				className={styles.button}
			>
				{ingredient}
			</button>

			<Popover id={id} anchorRef={anchorRef}>
				<form onSubmit={handleSubmit}>
					<input
						type="text"
						name="ingredient"
						value={value}
						onChange={(event) => setValue(event.target.value)}
						onBlur={() => handleChange(value)}
					/>
				</form>
			</Popover>
		</div>
	);
}
