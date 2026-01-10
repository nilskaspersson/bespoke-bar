import { redirect } from "next/navigation";
import type { ComponentProps } from "react";
import { draftIngredientSchema } from "@/db/schema/ingredients";
import { createIngredient } from "@/features/ingredients/api/createIngredient";
import { IngredientForm } from "@/features/ingredients/components/IngredientForm";
import { getIngredientUrl } from "@/features/ingredients/utils";
import { percentageToRatioSchema } from "@/features/ingredients/utils/percentageToRatio";

export function CreateIngredientForm(props: ComponentProps<"form">) {
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

		const ingredient = await createIngredient(values);

		redirect(getIngredientUrl(ingredient));
	};

	return (
		<form {...props} action={formAction}>
			<IngredientForm />
		</form>
	);
}
