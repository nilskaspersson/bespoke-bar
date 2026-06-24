"use client";

import { getMeasurementPriceUnit } from "@bespoke/domain/units/predicates";
import type {
	IngredientFormData,
	RecipeFormData,
} from "@bespoke/schema/schema/composite";
import { Alert } from "@bespoke/ui/Alert";
import { Button } from "@bespoke/ui/Button";
import type { Dialog } from "@bespoke/ui/Dialog";
import { Grid } from "@bespoke/ui/Grid";
import { TextField } from "@bespoke/ui/TextField";
import { handleKey } from "@bespoke/ui/utils/keyboard";
import { type FieldName, useField } from "@conform-to/react";
import type { ComponentProps } from "react";
import { SelectAbv } from "@/features/ingredients/components/SelectAbv";
import { SelectCategory } from "@/features/ingredients/components/SelectCategory";
import { SelectMeasurementType } from "@/features/ingredients/components/SelectMeasurementType";
import { SelectUnitCost } from "@/features/ingredients/components/SelectUnitCost";

export function IngredientDialogForm({
	children,
	ref,
	onClose,
	name,
	...props
}: Omit<ComponentProps<typeof Dialog>, "color"> & {
	name: FieldName<IngredientFormData, RecipeFormData>;
}) {
	const [field] = useField(name);

	const ingredient = field.getFieldset();

	return (
		<Alert
			ref={ref}
			onClose={onClose}
			heading="Edit ingredient"
			actions={
				<Button
					variant="solid"
					color="heavy"
					fullWidth
					onClick={() => ref?.current?.close()}
				>
					Apply
				</Button>
			}
			{...props}
		>
			<Grid
				as="fieldset"
				gap={3}
				onKeyDown={handleKey([["Enter", (event) => event.preventDefault()]])}
			>
				<TextField
					label="Ingredient name"
					key={ingredient.name.key}
					name={ingredient.name.name}
					defaultValue={ingredient.name.initialValue}
				/>

				<SelectCategory
					key={ingredient.category.key}
					name={ingredient.category.name}
					defaultValue={ingredient.category.initialValue ?? ""}
				/>

				<TextField
					as="textarea"
					label="Description"
					key={ingredient.description.key}
					name={ingredient.description.name}
					defaultValue={ingredient.description.initialValue}
					rows={3}
				/>

				<SelectAbv
					label="Alcohol by volume (ABV)"
					key={ingredient.abv.key}
					name={ingredient.abv.name}
					defaultValue={ingredient.abv.initialValue}
					helperText="Percentage value from 0-100%. Up to two decimal places."
					ingredient={undefined}
				/>

				<SelectMeasurementType
					key={ingredient.measurementType.key}
					name={ingredient.measurementType.name}
					defaultValue={ingredient.measurementType.initialValue}
				/>

				<SelectUnitCost
					label={`Cost per ${getMeasurementPriceUnit(ingredient.measurementType.value)}`}
					key={ingredient.unitCost.key}
					name={ingredient.unitCost.name}
					defaultValue={ingredient.unitCost.initialValue}
				/>

				<TextField
					label="Brand"
					key={ingredient.brand.key}
					name={ingredient.brand.name}
					defaultValue={ingredient.brand.initialValue}
				/>

				{children}
			</Grid>
		</Alert>
	);
}
