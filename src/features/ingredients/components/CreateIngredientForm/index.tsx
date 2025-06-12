import type { ComponentProps } from "react";
import { insertIngredientSchema } from "@/db/schema/ingredients";
import { createIngredient } from "@/features/ingredients/actions/createIngredient";
import { Grid } from "@/ui/Grid";
import { TextField } from "@/ui/TextField";

export async function CreateIngredientForm({
	...props
}: ComponentProps<"form">) {
	const formAction = async (formData: FormData) => {
		"use server";

		const values = insertIngredientSchema.parse({
			name: formData.get("name"),
			category: formData.get("category"),
			measurementType: formData.get("measurementType") ?? null,
			abv: formData.get("abv") ?? null,
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
					helperText="Percentage (from 0-100%). Up to two decimal places."
				/>

				<TextField
					label="Measurement type"
					name="measurementType"
					helperText='Used for unit conversion and price calculations. Choose "Volume"
							for liquids, "Weight" for solids, or "Count" for individual
							items (f.e., cherries, umbrellas).'
				/>

				<TextField label="Price" name="price" />
				<TextField label="Brand" name="brand" />
			</Grid>
		</form>
	);
}
