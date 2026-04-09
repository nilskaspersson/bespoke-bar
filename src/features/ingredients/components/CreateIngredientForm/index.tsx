import { redirect } from "next/navigation";
import type { ComponentProps } from "react";
import { draftIngredientFormSchema } from "@/db/schema/ingredients";
import { createIngredient } from "@/features/ingredients/api/createIngredient";
import { IngredientForm } from "@/features/ingredients/components/IngredientForm";
import { getIngredientUrl } from "@/features/ingredients/utils";

export function CreateIngredientForm(props: ComponentProps<"form">) {
	const formAction = async (formData: FormData) => {
		"use server";

		const values = draftIngredientFormSchema.parse({
			name: formData.get("name"),
			category: formData.get("category"),
			measurementType: formData.get("measurementType"),
			abv: formData.get("abv"),
			brand: formData.get("brand"),
			unitCost: formData.get("unitCost"),
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
