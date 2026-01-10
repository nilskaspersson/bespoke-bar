"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useCallback, useRef } from "react";
import {
	type RecipeListEntryWithRecipe,
	recipeListEntryFormSchema,
} from "@/db/schema/recipeListEntries";
import { updateRecipeListEntryAction } from "@/features/lists/api/updateRecipeListEntry";
import { RecipeEntryDiff } from "@/features/lists/components/RecipeEntryDiff";
import { RecipeEntryPriceCalculation } from "@/features/lists/components/RecipeEntryPriceCalculation";
import { UndoEntryChangesButton } from "@/features/lists/components/UndoEntryChangesButton";
import { isRecipeListEntry } from "@/features/lists/utils";
import { useModalContext } from "@/hooks/useModal";
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
};

export function UpdateRecipeEntryFormDialog({ entry }: Props) {
	const formRef = useRef<HTMLFormElement>(null);
	const { handleClose } = useModalContext();

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
						message: `${entry.recipe.name} updated`,
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
		<FormProvider context={form.context}>
			<form
				ref={formRef}
				action={handleSubmit}
				id={form.id}
				onSubmit={form.onSubmit}
			>
				<Alert
					onClose={handleClose}
					heading="Update sales price"
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
				</Alert>
			</form>
		</FormProvider>
	);
}
