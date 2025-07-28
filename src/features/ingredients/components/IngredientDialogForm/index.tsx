"use client";

import { type FieldName, useField } from "@conform-to/react";
import { type ComponentProps, useCallback } from "react";
import type { IngredientFormData, RecipeFormData } from "@/db/schema/composite";
import { SelectAbv } from "@/features/ingredients/components/SelectAbv";
import { SelectCategory } from "@/features/ingredients/components/SelectCategory";
import { SelectMeasurementType } from "@/features/ingredients/components/SelectMeasurementType";
import { SelectUnitCost } from "@/features/ingredients/components/SelectUnitCost";
import { getMeasurementPriceUnit } from "@/features/units/utils";
import { useFormatter } from "@/hooks/useFormatter";
import { Alert } from "@/ui/Alert";
import { Button } from "@/ui/Button";
import type { Dialog } from "@/ui/Dialog";
import { Grid } from "@/ui/Grid";
import { TextField } from "@/ui/TextField";
import { handleKey } from "@/utils/handleKey";

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
	const { options } = useFormatter();

	const handleClose = useCallback(() => {
		ref.current?.close();
		onClose?.();
	}, [ref, onClose]);

	return (
		<Alert
			ref={ref}
			onClose={handleClose}
			heading="Edit ingredient"
			actions={
				<Button variant="solid" color="heavy" fullWidth onClick={handleClose}>
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
					name={ingredient.name.name}
					defaultValue={ingredient.name.defaultValue}
				/>

				<SelectCategory
					name={ingredient.category.name}
					value={ingredient.category.value ?? ""}
				/>

				<TextField
					as="textarea"
					label="Description"
					name={ingredient.description.name}
					defaultValue={ingredient.description.defaultValue}
					rows={3}
				/>

				<SelectAbv
					label="Alcohol by volume (ABV)"
					name={ingredient.abv.name}
					defaultValue={ingredient.abv.defaultValue}
					helperText="Percentage value from 0-100%. Up to two decimal places."
					ingredient={undefined}
				/>

				<SelectMeasurementType
					name={ingredient.measurementType.name}
					defaultValue={ingredient.measurementType.defaultValue}
				/>

				<SelectUnitCost
					label={`Cost per ${getMeasurementPriceUnit(ingredient.measurementType.value)}`}
					name={ingredient.unitCost.name}
					defaultValue={ingredient.unitCost.defaultValue}
					currency={options.currency}
				/>

				<TextField
					label="Brand"
					name={ingredient.brand.name}
					defaultValue={ingredient.brand.defaultValue}
				/>

				{children}
			</Grid>
		</Alert>
	);
}
