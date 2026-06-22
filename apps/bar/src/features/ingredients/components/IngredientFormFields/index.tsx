"use client";

import { getMeasurementPriceUnit } from "@bespoke/domain/units/predicates";
import type {
	DraftIngredient,
	Ingredient,
} from "@bespoke/schema/schema/ingredients";
import { Grid } from "@bespoke/ui/Grid";
import { TextField } from "@bespoke/ui/TextField";
import type { FieldMetadata } from "@conform-to/react";
import type { RefObject } from "react";
import { SelectAbv } from "@/features/ingredients/components/SelectAbv";
import { SelectCategory } from "@/features/ingredients/components/SelectCategory";
import { SelectMeasurementType } from "@/features/ingredients/components/SelectMeasurementType";
import { SelectUnitCost } from "@/features/ingredients/components/SelectUnitCost";
import { FormErrors } from "@/ui/FormErrors";
import { hasErrors } from "@/utils/form";

type IngredientFieldName = keyof DraftIngredient;

type Props = {
	fields: Record<IngredientFieldName, FieldMetadata<unknown>>;
	formRef: RefObject<HTMLFormElement | null>;
	/** Omit for create mode. */
	ingredient?: Partial<Ingredient>;
};

export function IngredientFormFields({ fields, formRef, ingredient }: Props) {
	return (
		<Grid gap={5}>
			<TextField
				label="Ingredient name"
				key={fields.name.key}
				name={fields.name.name}
				defaultValue={fields.name.initialValue as string | undefined}
				id={fields.name.id}
				required
				aria-invalid={hasErrors(fields.name)}
			/>

			<TextField
				label="Description"
				key={fields.description.key}
				name={fields.description.name}
				defaultValue={fields.description.initialValue as string | undefined}
				id={fields.description.id}
				as="textarea"
				rows={3}
				aria-invalid={hasErrors(fields.description)}
			/>

			<SelectCategory
				key={fields.category.key}
				name={fields.category.name}
				defaultValue={fields.category.initialValue as string | undefined}
			/>

			<SelectAbv
				ingredient={ingredient}
				label="Alcohol by volume (ABV)"
				key={fields.abv.key}
				name={fields.abv.name}
				defaultValue={fields.abv.initialValue as string | undefined}
				id={fields.abv.id}
				helperText="Percentage value from 0-100%. Up to two decimal places."
				aria-invalid={hasErrors(fields.abv)}
			/>

			<SelectMeasurementType
				key={fields.measurementType.key}
				name={fields.measurementType.name}
				defaultValue={fields.measurementType.initialValue as string | undefined}
				helperText={`Used for unit conversion and cost calculations. Choose "Volume" for liquids, "Mass" for solids, or "Pieces" for individual items (f.e., cherries, umbrellas).`}
			/>

			<SelectUnitCost
				label={`Cost per ${getMeasurementPriceUnit(ingredient?.measurementType)}`}
				key={fields.unitCost.key}
				name={fields.unitCost.name}
				defaultValue={fields.unitCost.initialValue as string | undefined}
				id={fields.unitCost.id}
				aria-invalid={hasErrors(fields.unitCost)}
			/>

			<TextField
				label="Brand"
				key={fields.brand.key}
				name={fields.brand.name}
				defaultValue={fields.brand.initialValue as string | undefined}
				id={fields.brand.id}
				aria-invalid={hasErrors(fields.brand)}
			/>

			<FormErrors formRef={formRef} />
		</Grid>
	);
}
