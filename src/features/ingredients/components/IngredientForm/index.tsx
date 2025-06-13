import type { Ingredient } from "@/db/schema/ingredients";
import { Grid } from "@/ui/Grid";
import { SubmitButton } from "@/ui/SubmitButton";
import { TextField } from "@/ui/TextField";

export function IngredientForm({ ingredient }: { ingredient?: Ingredient }) {
	return (
		<Grid gap={4}>
			<TextField
				label="Ingredient name"
				name="name"
				required
				defaultValue={ingredient?.name}
			/>

			<TextField
				label="Category"
				name="category"
				defaultValue={ingredient?.category ?? undefined}
			/>

			<TextField
				label="Alcohol by volume (ABV)"
				name="abv"
				helperText="Percentage value from 0-100%. Up to two decimal places."
				defaultValue={ingredient?.abv ?? undefined}
			/>

			<TextField
				label="Measurement type"
				name="measurementType"
				helperText='Used for unit conversion and price calculations. Choose "Volume"
							for liquids, "Weight" for solids, or "Count" for individual
							items (f.e., cherries, umbrellas).'
				defaultValue={ingredient?.measurementType ?? undefined}
			/>

			<TextField
				label="Price"
				name="price"
				helperText="In your local currency"
				defaultValue={ingredient?.price ?? undefined}
			/>

			<TextField
				label="Brand"
				name="brand"
				defaultValue={ingredient?.brand ?? undefined}
			/>

			<SubmitButton>Save Ingredient</SubmitButton>
		</Grid>
	);
}
