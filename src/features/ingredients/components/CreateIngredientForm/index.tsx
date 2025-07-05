import type { ComponentProps } from "react";
import { draftIngredientSchema } from "@/db/schema/ingredients";
import { createIngredient } from "@/features/ingredients/actions/createIngredient";
import { IngredientForm } from "@/features/ingredients/components/IngredientForm";
import { percentageToRatioSchema } from "@/features/ingredients/utils/percentageToRatio";

export function CreateIngredientForm({ ...props }: ComponentProps<"form">) {
	const formAction = async (formData: FormData) => {
		"use server";

		const values = draftIngredientSchema.parse({
			name: formData.get("name"),
			category: formData.get("category") || null,
			measurementType: formData.get("measurementType") || null,
			abv: percentageToRatioSchema.parse(formData.get("abv")) || null,
			brand: formData.get("brand") || null,
			unitCost: formData.get("unitCost") || null,
		});

		await createIngredient(values);
	};

	return (
		<form {...props} action={formAction}>
			<IngredientForm />
		</form>
	);
}
