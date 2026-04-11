"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import { recipeListWithEntriesFormSchema } from "@/db/schema/composite";
import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RemoveListEntryButton } from "@/features/lists/actions/components/RemoveListEntryButton";
import { SelectRecipeList } from "@/features/lists/components/SelectRecipeList";
import { appendRecipeListEntryAction } from "@/features/lists/entries/api/appendRecipeListEntry";
import { removeRecipeFromList } from "@/features/lists/entries/api/removeRecipeFromList";
import { RecipeEntryPriceCalculation } from "@/features/lists/entries/components/RecipeEntryPriceCalculation";
import { RecipeListEntryCard } from "@/features/lists/entries/components/RecipeListEntryCard";
import {
	createDraftRecipeListEntry,
	getListName,
	isRecipeList,
	isRecipeListWithEntries,
} from "@/features/lists/utils";
import { trpc } from "@/trpc/client";
import { Button, LinkButton } from "@/ui/Button";
import { CurrencyInput } from "@/ui/CurrencyInput";
import { FormErrors } from "@/ui/FormErrors";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { OptionsList } from "@/ui/OptionsList";
import { Skeleton } from "@/ui/Skeleton";
import { Text } from "@/ui/Text";
import { TextField } from "@/ui/TextField";
import { ToastActions, toast } from "@/ui/Toast";
import { currencySchema } from "@/utils/currencySchema";
import styles from "./styles.module.css";

type Props = {
	recipe: RecipeWithSpecs;
	onSuccess?: () => void;
	formRef?: React.RefObject<HTMLFormElement | null>;
};

export function CreateListEntryForm({ recipe, onSuccess, formRef }: Props) {
	const internalFormRef = useRef<HTMLFormElement>(null);
	const resolvedFormRef = formRef ?? internalFormRef;

	const [withNewList, setWithNewList] = useState(false);
	const [comboboxInputValue, setComboboxInputValue] = useState("");

	const { data: lists } = trpc.recipeList.list.useQuery();

	const [form, fields] = useForm({
		id: `create-recipe-entry-${recipe.id}`,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: recipeListWithEntriesFormSchema,
			});
		},
		defaultValue: {
			recipeList: {
				id: "",
				name: "",
			},
			entries: [
				{
					recipeId: recipe.id,
					price: "",
					sortOrder: "",
				},
			],
		},
	});

	const entries = fields.entries.getFieldList();
	const recipeList = fields.recipeList.getFieldset();

	const handleSubmit = useCallback(
		async (formData: FormData) => {
			const toastId = Date.now().toString();

			const promise = appendRecipeListEntryAction(formData);

			toast.promise(promise, {
				id: toastId,
				loading: withNewList ? "Creating list…" : "Adding to list…",
				success: (result) => ({
					message: !isRecipeList(result) ? (
						"Unknown error"
					) : withNewList ? (
						<>
							List <em>"{getListName(result)}"</em> created
						</>
					) : (
						<>
							Recipe added to <em>"{getListName(result)}"</em>
						</>
					),
					action: isRecipeListWithEntries(result) ? (
						<ToastActions>
							<RemoveListEntryButton
								size="tiny"
								variant="ghost"
								color="heavy"
								actionRemove={removeRecipeFromList}
								entry={result.entries[0]}
								onClick={() => toast.dismiss(toastId)}
							>
								Undo
							</RemoveListEntryButton>

							<LinkButton
								size="tiny"
								href={`/bar/lists/${result.id}`}
								variant="ghost"
								color="heavy"
								prefetch={false}
								onClick={() => toast.dismiss(toastId)}
							>
								View List
								<Icon name="angles-right" size={0} />
							</LinkButton>
						</ToastActions>
					) : null,
				}),
				error: (error) => ({
					message:
						error instanceof Error
							? error.message
							: "Recipe could not be added to List.",
				}),
			});

			await promise;
			onSuccess?.();
		},
		[withNewList, onSuccess],
	);

	// Since we only have one entry (the current recipe), get the first entry's fields
	const firstEntry = entries[0];
	const entryFields = firstEntry?.getFieldset();
	const parsedPrice = currencySchema.safeParse(entryFields?.price.value);

	const draftEntry: RecipeListEntryWithRecipe | null = useMemo(
		() =>
			createDraftRecipeListEntry({
				recipe,
				recipeId: recipe.id,
				listId: recipeList.id.value ?? "",
				price: parsedPrice.success ? parsedPrice.data : null,
			}),
		[recipe, recipeList.id.value, parsedPrice.success, parsedPrice.data],
	);

	return (
		<FormProvider context={form.context}>
			<form
				ref={resolvedFormRef}
				action={handleSubmit}
				onSubmit={form.onSubmit}
				id={form.id}
			>
				<input type="submit" hidden form={form.id} />

				<Grid gap={4} className={styles.grid}>
					<Grid gap={2} className={styles.card}>
						{withNewList ? (
							<TextField
								label="New List name"
								name={recipeList.name.name}
								defaultValue={recipeList.name.defaultValue}
								id={recipeList.name.id}
								required
								large
								fullWidth
								autoFocus
							/>
						) : (
							<SelectRecipeList
								label="List"
								lists={lists}
								name={recipeList.id.name}
								defaultValue={recipeList.id.defaultValue}
								required
								inputProps={{
									large: true,
									fullWidth: true,
								}}
								comboboxProps={{
									initialInputValue: recipeList.name.value,
									onInputValueChange: ({ inputValue }) => {
										setComboboxInputValue(inputValue);
									},
								}}
								renderCreateListItem={({ closeMenu, inputValue }) => (
									<OptionsList.Item
										onClick={() => {
											form.update({
												name: recipeList.name.name,
												value: inputValue.trim(),
											});

											setWithNewList(true);
											closeMenu?.();
										}}
									>
										<OptionsList.Label
											description={<i>"{inputValue.trim()}"</i>}
										>
											Create new List
										</OptionsList.Label>
									</OptionsList.Item>
								)}
							/>
						)}

						<div>
							<Button
								variant="outline"
								color="light"
								size="tiny"
								onClick={() => {
									if (comboboxInputValue) {
										form.update({
											name: recipeList.name.name,
											value: comboboxInputValue.trim(),
										});
									}

									setWithNewList((prev) => !prev);
								}}
							>
								{withNewList ? "Use existing List" : "Create new List"}
							</Button>
						</div>
					</Grid>

					<Icon name="arrow-down-long" size={6} className={styles.arrow} />

					{firstEntry && entryFields && draftEntry ? (
						<Fragment key={firstEntry.id}>
							<input
								type="hidden"
								name={entryFields.recipeId.name}
								defaultValue={entryFields.recipeId.defaultValue}
							/>

							<RecipeListEntryCard className={styles.card} entry={draftEntry}>
								<details>
									<Text as="summary" size={2}>
										Set sales price
									</Text>

									<Grid as="fieldset" gap={5} className={styles.price}>
										<CurrencyInput
											label="Sales price"
											name={entryFields.price.name}
											defaultValue={entryFields.price.defaultValue}
											id={entryFields.price.id}
											compact
										/>

										<RecipeEntryPriceCalculation
											price={entryFields.price.value}
											recipe={recipe}
											priceInputId={entryFields.price.id}
										/>
									</Grid>
								</details>
							</RecipeListEntryCard>
						</Fragment>
					) : null}

					<FormErrors formRef={resolvedFormRef} />
				</Grid>
			</form>
		</FormProvider>
	);
}

export function CreateListEntryFormSkeleton() {
	return (
		<Grid gap={4} className={styles.grid}>
			<Grid gap={2}>
				<Skeleton variant="block" width="513px" height="152px" />
			</Grid>

			<Icon name="arrow-down-long" size={6} className={styles.arrow} />

			<Skeleton variant="block" width="513px" height="204px" />
		</Grid>
	);
}

CreateListEntryForm.Skeleton = CreateListEntryFormSkeleton;
