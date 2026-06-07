"use client";

import type { SubmissionResult } from "@conform-to/dom";
import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useRouter } from "next/navigation";
import { type ComponentProps, useRef, useState } from "react";
import { draftIngredientFormSchema } from "@/db/schema/ingredients";
import { createIngredient } from "@/features/ingredients/api/createIngredient";
import { IngredientFormFields } from "@/features/ingredients/components/IngredientFormFields";
import {
	ingredientEditorStore,
	useIngredientEditor,
} from "@/features/ingredients/stores/ingredientEditor";
import { getIngredientUrl } from "@/features/ingredients/utils";
import {
	clearIngredientDraft,
	readIngredientDraft,
	saveIngredientDraft,
} from "@/features/ingredients/utils/ingredientDraftStorage";
import { useInvalidateClientCache } from "@/hooks/useInvalidateClientCache";
import { toast } from "@/ui/Toast";

type Props = {
	formId: string;
};

export function CreateIngredientDrawerForm({
	formId,
	...props
}: Props & ComponentProps<"form">) {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const invalidateClientCache = useInvalidateClientCache();
	const setPending = useIngredientEditor((s) => s.setPending);
	const [submitting, setSubmitting] = useState(false);
	const [lastResult, setLastResult] = useState<SubmissionResult>();
	const [savedDraft] = useState(readIngredientDraft);

	const [form, fields] = useForm({
		id: formId,
		lastResult,
		defaultValue: {
			name: savedDraft.name,
			description: savedDraft.description,
			category: savedDraft.category,
			abv: savedDraft.abv,
			brand: savedDraft.brand,
			unitCost: savedDraft.unitCost,
			measurementType: savedDraft.measurementType,
		},
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: draftIngredientFormSchema });
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		async onSubmit(event, { formData }) {
			event.preventDefault();

			if (submitting) {
				return;
			}

			const submission = parseWithZod(formData, {
				schema: draftIngredientFormSchema,
			});

			if (submission.status !== "success") {
				setLastResult(submission.reply());
				return;
			}

			setSubmitting(true);
			setPending(true);

			try {
				const ingredient = await createIngredient(submission.value);

				toast.success(`Created Ingredient ${ingredient.name}`);
				invalidateClientCache("ingredient.create");
				clearIngredientDraft();

				ingredientEditorStore.dialogRef.current?.close();

				router.push(getIngredientUrl(ingredient));
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Could not create ingredient.",
				);
			} finally {
				setSubmitting(false);
				setPending(false);
			}
		},
	});

	return (
		<FormProvider context={form.context}>
			<form
				{...props}
				ref={formRef}
				id={form.id}
				onSubmit={form.onSubmit}
				onInput={(event) => saveIngredientDraft(event.currentTarget)}
				autoComplete="off"
				noValidate
			>
				<IngredientFormFields fields={fields} formRef={formRef} />
			</form>
		</FormProvider>
	);
}
