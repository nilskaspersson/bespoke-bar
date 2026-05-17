import { redirect } from "next/navigation";
import type { ComponentProps } from "react";
import { BottomRailItems } from "@/components/BottomRail";
import { draftIngredientFormSchema } from "@/db/schema/ingredients";
import { createIngredient } from "@/features/ingredients/api/createIngredient";
import { IngredientForm } from "@/features/ingredients/components/IngredientForm";
import { getIngredientUrl } from "@/features/ingredients/utils";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";

const FORM_ID = "create-ingredient-form";

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
		<>
			<form {...props} id={FORM_ID} action={formAction}>
				<IngredientForm />
			</form>

			<BottomRailItems>
				<SubmitButton variant="solid" color="accent" form={FORM_ID} rounded>
					<Icon name="circle-check" />
					Save changes
				</SubmitButton>
			</BottomRailItems>
		</>
	);
}
