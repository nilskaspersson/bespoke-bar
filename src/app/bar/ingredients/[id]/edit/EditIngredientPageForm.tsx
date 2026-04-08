"use client";

import type { SubmissionResult } from "@conform-to/dom";
import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { updateIngredientFormSchema } from "@/db/schema/ingredients";
import { updateIngredientAction } from "@/features/ingredients/api/updateIngredient";
import { SelectAbv } from "@/features/ingredients/components/SelectAbv";
import { SelectCategory } from "@/features/ingredients/components/SelectCategory";
import { SelectMeasurementType } from "@/features/ingredients/components/SelectMeasurementType";
import { SelectUnitCost } from "@/features/ingredients/components/SelectUnitCost";
import { getIngredientUrl } from "@/features/ingredients/utils";
import { getMeasurementPriceUnit } from "@/features/units/utils";
import { useInvalidateClientCache } from "@/hooks/useInvalidateClientCache";
import { FormErrors } from "@/ui/FormErrors";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { TextField } from "@/ui/TextField";
import { toast } from "@/ui/Toast";

type Props = {
	ingredient: Ingredient;
	redirectTo?: string;
};

function hasErrors(field: { errors?: unknown }): boolean {
	return Array.isArray(field.errors) && field.errors.length > 0;
}

export function EditIngredientPageForm({ ingredient, redirectTo }: Props) {
	const router = useRouter();
	const invalidateClientCache = useInvalidateClientCache();
	const formRef = useRef<HTMLFormElement>(null);
	const [lastResult, setLastResult] = useState<SubmissionResult>();

	const [form, fields] = useForm({
		id: `edit-ingredient-${ingredient.id}`,
		lastResult,
		defaultValue: {
			name: ingredient.name,
			description: ingredient.description,
			category: ingredient.category,
			abv: ingredient.abv != null ? `${ingredient.abv * 100}%` : undefined,
			brand: ingredient.brand,
			unitCost: ingredient.unitCost?.toString(),
			measurementType: ingredient.measurementType,
		},
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: updateIngredientFormSchema });
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		async onSubmit(event, { formData }) {
			event.preventDefault();

			const result = await updateIngredientAction(ingredient.id, formData);
			setLastResult(result);

			if (result.status === "error") {
				const messages = Object.values(result.error ?? {})
					.flat()
					.filter(Boolean) as string[];

				toast.error(
					messages.length > 0 ? (
						<ul>
							{messages.map((message) => (
								<li key={message}>{message}</li>
							))}
						</ul>
					) : (
						"Could not update ingredient."
					),
				);
				return;
			}

			toast.success(
				`Updated Ingredient ${formData.get("name") ?? ingredient.name}`,
			);

			invalidateClientCache("ingredient.update");
			router.push(redirectTo ?? getIngredientUrl(ingredient));
		},
	});

	return (
		<FormProvider context={form.context}>
			<form
				ref={formRef}
				id={form.id}
				onSubmit={form.onSubmit}
				autoComplete="off"
				noValidate
			>
				<Grid gap={5}>
					<TextField
						label="Ingredient name"
						key={fields.name.key}
						name={fields.name.name}
						defaultValue={fields.name.initialValue}
						id={fields.name.id}
						required
						aria-invalid={hasErrors(fields.name)}
					/>

					<TextField
						label="Description"
						key={fields.description.key}
						name={fields.description.name}
						defaultValue={fields.description.initialValue}
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
						aria-invalid={hasErrors(fields.abv)}
					/>

					<SelectMeasurementType
						key={fields.measurementType.key}
						name={fields.measurementType.name}
						defaultValue={
							fields.measurementType.initialValue as string | undefined
						}
						helperText={`Used for unit conversion and cost calculations. Choose "Volume" for liquids, "Mass" for solids, or "Pieces" for individual items (f.e., cherries, umbrellas).`}
					/>

					<SelectUnitCost
						label={`Cost per ${getMeasurementPriceUnit(ingredient.measurementType)}`}
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

					<div>
						<SubmitButton variant="solid" color="accent">
							<Icon name="circle-check" />
							Save changes
						</SubmitButton>
					</div>
				</Grid>
			</form>
		</FormProvider>
	);
}
