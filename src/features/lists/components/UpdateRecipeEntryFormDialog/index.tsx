"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useCallback, useRef } from "react";
import {
	type RecipeListEntryWithRecipe,
	recipeListEntryFormSchema,
} from "@/db/schema/recipeListEntries";
import { updateRecipeListEntryAction } from "@/features/lists/actions/updateRecipeListEntry";
import { RecipeEntryDiff } from "@/features/lists/components/RecipeEntryDiff";
import { RecipeEntryPriceCalculation } from "@/features/lists/components/RecipeEntryPriceCalculation";
import { UndoEntryChangesButton } from "@/features/lists/components/UndoEntryChangesButton";
import { isRecipeListEntry } from "@/features/lists/utils";
import { useServerAction } from "@/hooks/useServerAction";
import { Alert } from "@/ui/Alert";
import { Button } from "@/ui/Button";
import { CurrencyInput } from "@/ui/CurrencyInput";
import { FormErrors } from "@/ui/FormErrors";
import { Grid } from "@/ui/Grid";
import { SubmitButton } from "@/ui/SubmitButton";
import { ToastActions, toast } from "@/ui/Toast";

type Props = {
	entry: RecipeListEntryWithRecipe;
	handleClose: () => void;
};

export function UpdateRecipeEntryFormDialog({ entry, handleClose }: Props) {
	const formRef = useRef<HTMLFormElement>(null);

	const { action: handleUpdateRecipeListEntry } = useServerAction(
		updateRecipeListEntryAction.bind(null, entry.id),
		handleClose,
	);

	const [form, fields] = useForm({
		id: `update-recipe-entry-${entry.id}`,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: recipeListEntryFormSchema,
			});
		},
		defaultValue: {
			price: entry.price,
			sortOrder: entry.sortOrder,
			recipeId: entry.recipeId,
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
						message: "Entry updated",
						description: isRecipeListEntry(result) ? (
							<RecipeEntryDiff a={entry} b={result} />
						) : null,
					}),
					error: () => ({
						message: "List entry could not be updated.",
						description: "Try again later.",
					}),
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
				});
			} catch (_e) {}
		},
		[handleUpdateRecipeListEntry, entry],
	);

	return (
		<FormProvider context={form.context}>
			<form ref={formRef} action={handleSubmit} id={form.id}>
				<Alert
					onClose={handleClose}
					heading="Update list entry"
					actions={
						<>
							<Button
								variant="outline"
								color="light"
								size="small"
								onClick={handleClose}
							>
								Cancel
							</Button>

							<SubmitButton variant="solid" color="heavy" size="small">
								Save
							</SubmitButton>
						</>
					}
				>
					<input type="submit" hidden form={form.id} />

					<input
						type="hidden"
						name={fields.recipeId.name}
						value={fields.recipeId.defaultValue}
						id={fields.recipeId.id}
					/>

					<Grid gap={6}>
						<CurrencyInput
							label="Price"
							large
							name={fields.price.name}
							id={fields.price.id}
							defaultValue={fields.price.defaultValue}
						/>

						<FormErrors formRef={formRef} />

						<RecipeEntryPriceCalculation
							price={fields.price.value}
							recipe={entry.recipe}
						/>
					</Grid>
				</Alert>
			</form>
		</FormProvider>
	);
}
