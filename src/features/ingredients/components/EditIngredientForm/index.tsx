"use client";

import type { SubmissionResult } from "@conform-to/dom";
import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { type ComponentProps, useRef, useState } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { updateIngredientFormSchema } from "@/db/schema/ingredients";
import { updateIngredientAction } from "@/features/ingredients/api/updateIngredient";
import { SelectAbv } from "@/features/ingredients/components/SelectAbv";
import { SelectCategory } from "@/features/ingredients/components/SelectCategory";
import { SelectMeasurementType } from "@/features/ingredients/components/SelectMeasurementType";
import { SelectUnitCost } from "@/features/ingredients/components/SelectUnitCost";
import {
	ingredientEditorStore,
	useIngredientEditor,
} from "@/features/ingredients/stores/ingredientEditor";
import { getMeasurementPriceUnit } from "@/features/units/utils";
import { FormErrors } from "@/ui/FormErrors";
import { Grid } from "@/ui/Grid";
import { TextField } from "@/ui/TextField";
import { toast } from "@/ui/Toast";

type Props = {
	formId: string;
	ingredient: Partial<Ingredient>;
};

function hasErrors(field: { errors?: unknown }): boolean {
	return Array.isArray(field.errors) && field.errors.length > 0;
}

export function EditIngredientForm({
	formId,
	ingredient,
	...props
}: Props & ComponentProps<"form">) {
	const formRef = useRef<HTMLFormElement>(null);
	const setPending = useIngredientEditor((s) => s.setPending);
	const [submitting, setSubmitting] = useState(false);
	const [lastResult, setLastResult] = useState<SubmissionResult>();

	const [form, fields] = useForm({
		id: formId,
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

			if (!ingredient.id || submitting) {
				return;
			}

			setSubmitting(true);
			setPending(true);

			const result = await updateIngredientAction(ingredient.id, formData);

			setSubmitting(false);
			setPending(false);

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

			toast.success(`Updated: ${ingredient.name}`);
			ingredientEditorStore.emitUpdate({
				...(ingredient as Ingredient),
			});
			formRef.current?.closest("dialog")?.close();
		},
	});

	return (
		<FormProvider context={form.context}>
			<form
				{...props}
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
						label={`Cost per ${getMeasurementPriceUnit(ingredient?.measurementType)}`}
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
				</Grid>
			</form>
		</FormProvider>
	);
}
