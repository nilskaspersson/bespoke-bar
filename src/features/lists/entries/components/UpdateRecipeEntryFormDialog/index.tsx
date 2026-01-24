"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { use, useCallback, useId, useRef } from "react";
import {
	type RecipeListEntryWithRecipe,
	recipeListEntryFormSchema,
} from "@/db/schema/recipeListEntries";
import { UndoEntryChangesButton } from "@/features/lists/actions/components/UndoEntryChangesButton";
import { updateRecipeListEntryAction } from "@/features/lists/entries/api/updateRecipeListEntry";
import { RecipeEntryDiff } from "@/features/lists/entries/components/RecipeEntryDiff";
import { RecipeEntryPriceCalculation } from "@/features/lists/entries/components/RecipeEntryPriceCalculation";
import { isRecipeListEntry } from "@/features/lists/utils";
import { DialogContext } from "@/hooks/useDialog";
import { useServerAction } from "@/hooks/useServerAction";
import { CurrencyInput } from "@/ui/CurrencyInput";
import { Drawer } from "@/ui/Drawer";
import { FormErrors } from "@/ui/FormErrors";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { HGroup } from "@/ui/HGroup";
import { SubmitButton } from "@/ui/SubmitButton";
import { ToastActions, toast } from "@/ui/Toast";

type Props = {
	entry: RecipeListEntryWithRecipe;
};

export function UpdateRecipeEntryFormDialog({ entry }: Props) {
	const formId = useId();
	const formRef = useRef<HTMLFormElement>(null);
	const dialog = use(DialogContext);

	const { action: handleUpdateRecipeListEntry } = useServerAction(
		updateRecipeListEntryAction.bind(null, entry.id),
		dialog?.closeDialog,
	);

	const [form, fields] = useForm({
		id: formId,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: recipeListEntryFormSchema,
			});
		},
		defaultValue: {
			price: entry.price,
			sortOrder: entry.sortOrder,
			recipeId: entry.recipeId,
			listId: entry.listId,
		},
	});

	const handleSubmit = useCallback(
		async (formData: FormData) => {
			const toastId = Date.now().toString();

			try {
				const promise = handleUpdateRecipeListEntry(formData);

				toast.promise(promise, {
					id: toastId,
					loading: "Saving…",
					success: (result) => ({
						message: (
							<>
								Updated: <em>{entry.recipe.name}</em>
							</>
						),
						description: isRecipeListEntry(result) ? (
							<RecipeEntryDiff a={entry} b={result} />
						) : null,
						action: (
							<ToastActions>
								<UndoEntryChangesButton
									entry={entry}
									onClick={() => toast.dismiss(toastId)}
								>
									Undo
								</UndoEntryChangesButton>
							</ToastActions>
						),
					}),
					error: () => ({
						message: "List entry could not be updated.",
						description: "Try again later.",
					}),
				});
			} catch (_e) {}
		},
		[handleUpdateRecipeListEntry, entry],
	);

	return (
		<Drawer
			ref={dialog?.dialogRef}
			onClose={dialog?.closeDialog}
			header={
				<HGroup overline="Update sales price">
					<Heading level="h3" size={6}>
						{entry.recipe.name}
					</Heading>
				</HGroup>
			}
			actions={
				<li>
					<SubmitButton variant="solid" color="accent" size="small">
						Save
					</SubmitButton>
				</li>
			}
		>
			<FormProvider context={form.context}>
				<form
					ref={formRef}
					action={handleSubmit}
					id={form.id}
					onSubmit={form.onSubmit}
				>
					<input type="submit" hidden form={form.id} />

					<input
						type="hidden"
						name={fields.recipeId.name}
						value={fields.recipeId.value}
						id={fields.recipeId.id}
					/>

					<input
						type="hidden"
						name={fields.listId.name}
						value={fields.listId.value}
						id={fields.listId.id}
					/>

					<Grid gap={6}>
						<CurrencyInput
							label="Sales price"
							large
							name={fields.price.name}
							id={fields.price.id}
							defaultValue={fields.price.defaultValue}
						/>

						<FormErrors formRef={formRef} />

						<RecipeEntryPriceCalculation
							price={fields.price.value}
							recipe={entry.recipe}
							priceInputId={fields.price.id}
						/>
					</Grid>
				</form>
			</FormProvider>
		</Drawer>
	);
}
