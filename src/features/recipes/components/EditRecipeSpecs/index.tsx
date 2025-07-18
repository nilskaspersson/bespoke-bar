"use client";

import { type FieldName, useField } from "@conform-to/react";
import { clsx } from "clsx";
import { type ComponentProps, useState } from "react";
import type { RecipeFormData } from "@/db/schema/composite";
import type { Ingredient } from "@/db/schema/ingredients";
import { Button } from "@/ui/Button";
import { Checkbox } from "@/ui/Checkbox";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { EditRecipeSpecItem } from "./EditRecipeSpecItem";
import styles from "./styles.module.css";

type Spec = NonNullable<RecipeFormData["specs"]>;

export function EditRecipeSpecs({
	className,
	ingredients,
	name,
	...props
}: {
	ingredients: Ingredient[];
	name: FieldName<Spec, RecipeFormData>;
} & ComponentProps<"fieldset">) {
	const [fields, form] = useField(name);
	const specs = fields.getFieldList();

	const [optional, setOptional] = useState(
		specs.some((spec) => spec.getFieldset().optional.value),
	);

	return (
		<Grid
			as="fieldset"
			gap={2}
			className={clsx(className, styles.fieldset)}
			{...props}
		>
			<Grid as="ul" gap={2}>
				{specs.map((field, index) => (
					<EditRecipeSpecItem
						key={field.key}
						name={field.name}
						actions={
							<Button
								variant="ghost"
								color="red"
								size="small"
								icon
								type="submit"
								aria-label="Remove spec"
								title="Remove spec"
								{...form.remove.getButtonProps({
									name: fields.name,
									index,
								})}
							>
								<Icon name="xmark" size={3} />
							</Button>
						}
						ingredients={ingredients}
						withOptional={optional}
					/>
				))}
			</Grid>

			<div className={clsx(styles.card, styles.add)}>
				<Button
					type="submit"
					variant="solid"
					rounded
					fullWidth
					color="light"
					{...form.insert.getButtonProps({
						name: fields.name,
						defaultValue: {
							quantity: "1",
							unit: "cl",
							ingredientId: undefined,
							optional: false,
							ingredient: {
								name: "",
								description: "",
								abv: undefined,
								brand: "",
								category: "",
								measurementType: "volume",
								unitCost: "",
							},
						},
					})}
				>
					Add additional spec
				</Button>
			</div>

			<Checkbox
				label="Enable optional specs"
				checked={optional}
				onChange={(e) => {
					setOptional(e.target.checked);
				}}
			/>
		</Grid>
	);
}
