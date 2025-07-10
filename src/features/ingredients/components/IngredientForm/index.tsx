import type { Ingredient } from "@/db/schema/ingredients";
import type { Organisation } from "@/db/schema/organisations";
import { SelectAbv } from "@/features/ingredients/components/SelectAbv";
import { SelectCategory } from "@/features/ingredients/components/SelectCategory";
import { SelectMeasurementType } from "@/features/ingredients/components/SelectMeasurementType";
import { SelectUnitCost } from "@/features/ingredients/components/SelectUnitCost";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { TextField } from "@/ui/TextField";

export function IngredientForm({
	ingredient,
	organisation,
}: {
	ingredient?: Ingredient;
	organisation: Organisation;
}) {
	return (
		<Grid gap={5}>
			<TextField
				label="Ingredient name"
				name="name"
				required
				defaultValue={ingredient?.name}
			/>

			<SelectCategory defaultValue={ingredient?.category ?? undefined} />

			<TextField
				label="Description"
				name="description"
				as="textarea"
				rows={3}
				defaultValue={ingredient?.description ?? undefined}
			/>

			<SelectAbv
				ingredient={ingredient}
				label="Alcohol by volume (ABV)"
				name="abv"
				helperText="Percentage value from 0-100%. Up to two decimal places."
			/>

			<SelectMeasurementType
				defaultValue={ingredient?.measurementType ?? undefined}
				helperText={`Used for unit conversion and cost calculations. Choose "Volume" for liquids, "Mass" for solids, or "Pieces" for individual items (f.e., cherries, umbrellas).`}
			/>

			<SelectUnitCost
				currency={organisation.currency}
				label="Cost per liter"
				name="unitCost"
				defaultValue={ingredient?.unitCost ?? undefined}
			/>

			<TextField
				label="Brand"
				name="brand"
				defaultValue={ingredient?.brand ?? undefined}
			/>

			<div>
				<SubmitButton variant="solid" color="accent">
					<Icon name="circle-check" />
					Save changes
				</SubmitButton>
			</div>
		</Grid>
	);
}
