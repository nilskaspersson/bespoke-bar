import type { ComponentProps } from "react";
import { draftIngredientSchema } from "@/db/schema/ingredients";
import { createIngredient } from "@/features/ingredients/actions/createIngredient";
import { percentageToRatioSchema } from "@/features/ingredients/utils/percentageToRatio";
import { Grid } from "@/ui/Grid";
import { SubmitButton } from "@/ui/SubmitButton";
import { TextField } from "@/ui/TextField";

export function CreateIngredientForm({ ...props }: ComponentProps<"form">) {
	const formAction = async (formData: FormData) => {
		"use server";

		const values = draftIngredientSchema.parse({
			name: formData.get("name"),
			category: formData.get("category"),
			measurementType: formData.get("measurementType") ?? null,
			abv: percentageToRatioSchema.parse(formData.get("abv")),
			brand: formData.get("brand") ?? null,
			price: formData.get("price") ?? null,
		});

		await createIngredient(values);
	};

	return (
		<form {...props} action={formAction}>
			<Grid gap={4}>
				<TextField label="Ingredient name" name="name" required />
				<TextField label="Category" name="category" />

				<TextField
					label="Alcohol by volume (ABV)"
					name="abv"
					placeholder="%"
					helperText="Percentage value from 0-100%. Up to two decimal places."
				/>

				<TextField
					label="Measurement type"
					name="measurementType"
					helperText='Used for unit conversion and price calculations. Choose "Volume"
							for liquids, "Weight" for solids, or "Count" for individual
							items (f.e., cherries, umbrellas).'
				/>

				<TextField
					label="Price"
					name="price"
					helperText="In your local currency"
				/>

				<TextField label="Brand" name="brand" />

				<SubmitButton>Save Ingredient</SubmitButton>
			</Grid>
		</form>
	);
}
