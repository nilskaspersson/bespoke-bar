"use client";

import { type FieldName, useField } from "@conform-to/react";
import type { ComponentProps } from "react";
import type { RecipeFormData } from "@/db/schema/composite";
import type { Ingredient } from "@/db/schema/ingredients";
import { IngredientPicker } from "@/features/ingredients/components/IngredientPicker";
import { QuantityControl } from "@/features/quantity/components/QuantityControl";
import { SelectUnit } from "@/features/units/components/SelectUnit";
import { Button } from "@/ui/Button";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

type Spec = NonNullable<RecipeFormData["specs"]>;

export function EditRecipeSpecs(
	props: {
		name: FieldName<Spec, RecipeFormData>;
		ingredients: Ingredient[];
	} & ComponentProps<"fieldset">,
) {
	const [fields, form] = useField(props.name);

	const specs = fields.getFieldList();

	return (
		<Grid as="fieldset" gap={2} {...props}>
			<Grid as="ul" gap={2}>
				{specs.map((field, index) => {
					const spec = field.getFieldset();

					return (
						<li key={field.key} className={styles.item}>
							<input
								type="hidden"
								name={spec.id.name}
								value={spec.id.defaultValue ?? spec.id.id}
							/>

							<QuantityControl
								name={spec.quantity.name}
								defaultValue={spec.quantity.defaultValue}
								compact
							/>

							<SelectUnit
								name={spec.unit.name}
								defaultValue={spec.unit.defaultValue}
								placeholder="Unit"
								compact
								rounded
								className={styles.unit}
							/>

							<IngredientPicker
								className={styles.ingredient}
								ingredients={props.ingredients}
								name={spec.ingredientId.name}
								defaultValue={spec.ingredientId.defaultValue}
								inputProps={{
									compact: true,
									rounded: true,
								}}
							/>

							<Button
								variant="ghost"
								color="red"
								size="small"
								icon
								type="submit"
								aria-label="Remove spec"
								title="Remove spec"
								className={styles.remove}
								{...form.remove.getButtonProps({
									name: fields.name,
									index,
								})}
							>
								<Icon name="xmark" size={3} />
							</Button>
						</li>
					);
				})}
			</Grid>

			<div className={styles.item}>
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
						},
					})}
				>
					Add additional spec
				</Button>
			</div>
		</Grid>
	);
}
