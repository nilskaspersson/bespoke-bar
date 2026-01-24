"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { use, useCallback, useMemo, useRef } from "react";
import useSWRImmutable from "swr/immutable";
import type { RecipeListWithEntries } from "@/db/schema/composite";
import {
	type RecipeListEntryWithRecipe,
	recipeListEntryFormSchema,
} from "@/db/schema/recipeListEntries";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RemoveListEntryButton } from "@/features/lists/actions/components/RemoveListEntryButton";
import { SelectRecipeList } from "@/features/lists/components/SelectRecipeList";
import { addRecipeToListAction } from "@/features/lists/entries/api/addRecipeToList";
import { removeRecipeFromList } from "@/features/lists/entries/api/removeRecipeFromList";
import { RecipeEntryPriceCalculation } from "@/features/lists/entries/components/RecipeEntryPriceCalculation";
import { RecipeListEntryCard } from "@/features/lists/entries/components/RecipeListEntryCard";
import {
	createDraftRecipeListEntry,
	isRecipeListEntry,
	recipeListsFetcher,
} from "@/features/lists/utils";
import { DialogContext } from "@/hooks/useDialog";
import { useServerAction } from "@/hooks/useServerAction";
import { LinkButton } from "@/ui/Button";
import { CurrencyInput } from "@/ui/CurrencyInput";
import { Drawer } from "@/ui/Drawer";
import { FormErrors } from "@/ui/FormErrors";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { HGroup } from "@/ui/HGroup";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { ToastActions, toast } from "@/ui/Toast";
import { currencySchema } from "@/utils/currencySchema";
import styles from "./styles.module.css";

type Props = {
	recipe: RecipeWithSpecs;
};

export function AddToListDialog({ recipe }: Props) {
	const dialog = use(DialogContext);
	const formRef = useRef<HTMLFormElement>(null);

	const { data: lists } = useSWRImmutable<RecipeListWithEntries[] | undefined>(
		"/api/lists",
		recipeListsFetcher,
	);

	const { action } = useServerAction(
		addRecipeToListAction,
		dialog?.closeDialog,
	);

	const [form, fields] = useForm({
		id: `create-recipe-entry-${recipe.id}`,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: recipeListEntryFormSchema,
			});
		},
		defaultValue: {
			recipeId: recipe.id,
			price: "",
			sortOrder: "",
			listId: "",
		},
	});

	const handleSubmit = useCallback(
		async (formData: FormData) => {
			const toastId = Date.now().toString();

			try {
				const promise = action(formData);

				toast.promise(promise, {
					id: toastId,
					loading: "Adding to list…",
					success: (result) => ({
						message: "Recipe added",
						action: isRecipeListEntry(result) ? (
							<ToastActions>
								<RemoveListEntryButton
									size="tiny"
									variant="ghost"
									color="heavy"
									actionRemove={removeRecipeFromList}
									entry={result}
									onClick={() => toast.dismiss(toastId)}
								>
									Undo
								</RemoveListEntryButton>

								<LinkButton
									size="tiny"
									href={`/bar/lists/${result.listId}`}
									variant="ghost"
									color="heavy"
									prefetch={false}
									onClick={() => toast.dismiss(toastId)}
								>
									View list
									<Icon name="angles-right" size={0} />
								</LinkButton>
							</ToastActions>
						) : null,
					}),
					error: (error) => ({
						message:
							error instanceof Error
								? error.message
								: "Recipe could not be added to list.",
					}),
				});
			} catch (_e) {}
		},
		[action],
	);

	const draftEntry: RecipeListEntryWithRecipe | null = useMemo(
		() =>
			createDraftRecipeListEntry({
				recipe,
				recipeId: recipe.id,
				listId: fields.listId.value ?? "",
				price: currencySchema.safeParse(fields.price.value).data,
			}),
		[recipe, fields.listId.value, fields.price.value],
	);

	return (
		<Drawer
			ref={dialog?.dialogRef}
			onClose={dialog?.closeDialog}
			header={
				<HGroup overline="Add to list">
					<Heading level="h3" size={6}>
						{recipe.name}
					</Heading>
				</HGroup>
			}
			actions={
				<li>
					<SubmitButton variant="solid" color="accent" size="small">
						Add
					</SubmitButton>
				</li>
			}
		>
			<FormProvider context={form.context}>
				<form
					ref={formRef}
					action={handleSubmit}
					onSubmit={form.onSubmit}
					id={form.id}
				>
					<input type="submit" hidden form={form.id} />

					<input
						type="hidden"
						name={fields.recipeId.name}
						value={fields.recipeId.value}
					/>

					<Grid gap={4} className={styles.grid}>
						{draftEntry ? (
							<RecipeListEntryCard className={styles.card} entry={draftEntry} />
						) : null}

						<Icon name="arrow-down-long" size={6} className={styles.arrow} />

						<SelectRecipeList
							label="List"
							lists={lists}
							name={fields.listId.name}
							defaultValue={fields.listId.defaultValue}
							required
							inputProps={{
								large: true,
								fullWidth: true,
							}}
						/>

						<Grid gap={5} className={styles.price}>
							<CurrencyInput
								label="Sales price"
								name={fields.price.name}
								defaultValue={fields.price.defaultValue}
								id={fields.price.id}
								compact
							/>

							<RecipeEntryPriceCalculation
								price={fields.price.value}
								recipe={recipe}
								priceInputId={fields.price.id}
							/>
						</Grid>

						<FormErrors formRef={formRef} />
					</Grid>
				</form>
			</FormProvider>
		</Drawer>
	);
}
