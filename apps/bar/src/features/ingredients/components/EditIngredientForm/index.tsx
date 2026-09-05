"use client";

import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { updateIngredientFormSchema } from "@bespoke/schema/schema/ingredients";
import {
	ingredientEditorStore,
	useIngredientEditor,
} from "@bespoke/ui/stores/ingredientEditor";
import { toast } from "@bespoke/ui/Toast";
import {
	FormProvider,
	type SubmissionResult,
	useForm,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { type ComponentProps, useRef, useState } from "react";
import { updateIngredientAction } from "@/features/ingredients/api/updateIngredient";
import { IngredientFormFields } from "@/features/ingredients/components/IngredientFormFields";
import { useInvalidateClientCache } from "@/hooks/useInvalidateClientCache";

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
	const invalidateClientCache = useInvalidateClientCache();
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

			toast.success(
				`Updated Ingredient ${formData.get("name") ?? ingredient.name}`,
			);

			invalidateClientCache("ingredient.update");
			ingredientEditorStore.emitUpdate({
				...(ingredient as Ingredient),
				name: (formData.get("name") as string) ?? ingredient.name,
			});
			ingredientEditorStore.dialogRef.current?.close();
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
				<IngredientFormFields
					fields={fields}
					formRef={formRef}
					ingredient={ingredient}
				/>
			</form>
		</FormProvider>
	);
}
