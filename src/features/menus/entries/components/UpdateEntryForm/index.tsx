"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useCallback, useId, useRef } from "react";
import {
	type MenuEntryWithRecipe,
	menuEntryFormSchema,
} from "@/db/schema/menuEntries";
import { UndoEntryChangesButton } from "@/features/menus/actions/components/UndoEntryChangesButton";
import { updateMenuEntryAction } from "@/features/menus/entries/api/updateMenuEntry";
import { MenuEntryDiff } from "@/features/menus/entries/components/MenuEntryDiff";
import { MenuEntryPriceCalculation } from "@/features/menus/entries/components/MenuEntryPriceCalculation";
import { isMenuEntry } from "@/features/menus/utils";
import { CurrencyInput } from "@/ui/CurrencyInput";
import { FormErrors } from "@/ui/FormErrors";
import { Grid } from "@/ui/Grid";
import { Skeleton } from "@/ui/Skeleton";
import { ToastActions, toast } from "@/ui/Toast";

type Props = {
	entry: MenuEntryWithRecipe;
	onSuccess: () => void;
};

export function UpdateEntryForm({ entry, onSuccess }: Props) {
	const formId = useId();
	const formRef = useRef<HTMLFormElement>(null);

	const [form, fields] = useForm({
		id: formId,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: menuEntryFormSchema,
			});
		},
		defaultValue: {
			price: entry.price,
			sortOrder: entry.sortOrder,
			recipeId: entry.recipeId,
			menuId: entry.menuId,
		},
	});

	const handleSubmit = useCallback(
		async (formData: FormData) => {
			const toastId = Date.now().toString();

			const promise = updateMenuEntryAction(entry.id, formData);

			toast.promise(promise, {
				id: toastId,
				loading: "Saving…",
				success: (result) => ({
					message: (
						<>
							Updated: <em>{entry.recipe.name}</em>
						</>
					),
					description: isMenuEntry(result) ? (
						<MenuEntryDiff a={entry} b={result} />
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
					message: "Menu entry could not be updated.",
					description: "Try again later.",
				}),
			});

			await promise;
			onSuccess();
		},
		[entry, onSuccess],
	);

	return (
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
					name={fields.menuId.name}
					value={fields.menuId.value}
					id={fields.menuId.id}
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

					<MenuEntryPriceCalculation
						price={fields.price.value}
						recipe={entry.recipe}
						priceInputId={fields.price.id}
					/>
				</Grid>
			</form>
		</FormProvider>
	);
}

export function UpdateEntryFormSkeleton() {
	return (
		<Grid gap={6}>
			<Grid gap={2}>
				<Skeleton variant="text" width="68px" height="17px" />
				<Skeleton variant="input" />
				<Skeleton variant="text" width="105px" height="15px" />
			</Grid>

			<Skeleton variant="block" width="250px" height="109px" />
		</Grid>
	);
}

UpdateEntryForm.Skeleton = UpdateEntryFormSkeleton;
