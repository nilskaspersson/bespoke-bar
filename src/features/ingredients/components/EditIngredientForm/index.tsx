"use client";

import { type ComponentProps, useRef } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { updateIngredientSchema } from "@/db/schema/ingredients";
import { updateIngredient } from "@/features/ingredients/api/updateIngredient";
import { SelectAbv } from "@/features/ingredients/components/SelectAbv";
import { SelectCategory } from "@/features/ingredients/components/SelectCategory";
import { SelectMeasurementType } from "@/features/ingredients/components/SelectMeasurementType";
import { SelectUnitCost } from "@/features/ingredients/components/SelectUnitCost";
import {
	ingredientEditorStore,
	useIngredientEditor,
} from "@/features/ingredients/stores/ingredientEditor";
import { percentageToRatioSchema } from "@/features/ingredients/utils/percentageToRatio";
import { getMeasurementPriceUnit } from "@/features/units/utils";
import { Grid } from "@/ui/Grid";
import { TextField } from "@/ui/TextField";
import { toast } from "@/ui/Toast";

type Props = {
	formId: string;
	ingredient: Partial<Ingredient>;
};

export function EditIngredientForm({
	formId,
	ingredient,
	...props
}: Props & ComponentProps<"form">) {
	const formRef = useRef<HTMLFormElement>(null);
	const setPending = useIngredientEditor((s) => s.setPending);

	const formAction = async (formData: FormData) => {
		if (!ingredient.id || ingredientEditorStore.getState().pending) {
			return;
		}

		setPending(true);

		const values = updateIngredientSchema.parse({
			name: formData.get("name"),
			category: formData.get("category"),
			description: formData.get("description"),
			abv: percentageToRatioSchema.parse(formData.get("abv")),
			brand: formData.get("brand"),
			unitCost: formData.get("unitCost"),
			measurementType: formData.get("measurementType"),
		});

		const promise = updateIngredient(ingredient.id, values);

		toast.promise(promise, {
			loading: "Saving…",
			success: () => ({
				message: `Updated: ${ingredient.name}`,
			}),
			error: () => ({
				message: "Could not update ingredient.",
				description: "Try again later.",
			}),
		});

		await promise;
		formRef.current?.closest("dialog")?.close();
	};

	return (
		<form {...props} ref={formRef} id={formId} action={formAction}>
			<Grid gap={5}>
				<TextField
					label="Ingredient name"
					name="name"
					required
					defaultValue={ingredient?.name}
				/>

				<TextField
					label="Description"
					name="description"
					as="textarea"
					rows={3}
					defaultValue={ingredient?.description ?? undefined}
				/>

				<SelectCategory
					name="category"
					defaultValue={ingredient?.category ?? undefined}
				/>

				<SelectAbv
					ingredient={ingredient}
					label="Alcohol by volume (ABV)"
					name="abv"
					helperText="Percentage value from 0-100%. Up to two decimal places."
				/>

				<SelectMeasurementType
					name="measurementType"
					defaultValue={ingredient?.measurementType ?? undefined}
					helperText={`Used for unit conversion and cost calculations. Choose "Volume" for liquids, "Mass" for solids, or "Pieces" for individual items (f.e., cherries, umbrellas).`}
				/>

				<SelectUnitCost
					label={`Cost per ${getMeasurementPriceUnit(ingredient?.measurementType)}`}
					name="unitCost"
					defaultValue={ingredient?.unitCost ?? undefined}
				/>

				<TextField
					label="Brand"
					name="brand"
					defaultValue={ingredient?.brand ?? undefined}
				/>
			</Grid>
		</form>
	);
}
