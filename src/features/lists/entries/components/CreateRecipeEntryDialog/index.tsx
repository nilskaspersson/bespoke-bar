"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Fragment, useCallback, useId, useRef, useState } from "react";
import useSWRImmutable from "swr/immutable";
import {
	type RecipeListWithEntries,
	recipeListWithEntriesFormSchema,
} from "@/db/schema/composite";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RemoveListEntryButton } from "@/features/lists/actions/components/RemoveListEntryButton";
import { SelectRecipeList } from "@/features/lists/components/SelectRecipeList";
import { appendRecipeListEntryAction } from "@/features/lists/entries/api/appendRecipeListEntry";
import { removeRecipeFromList } from "@/features/lists/entries/api/removeRecipeFromList";
import { RecipeEntryPriceCalculation } from "@/features/lists/entries/components/RecipeEntryPriceCalculation";
import { RecipeListEntryCard } from "@/features/lists/entries/components/RecipeListEntryCard";
import {
	isRecipeListWithEntries,
	recipeListFetcher,
} from "@/features/lists/utils";
import { useModalContext } from "@/hooks/useModal";
import { useServerAction } from "@/hooks/useServerAction";
import { Alert } from "@/ui/Alert";
import { Button, LinkButton } from "@/ui/Button";
import { CurrencyInput } from "@/ui/CurrencyInput";
import { FormErrors } from "@/ui/FormErrors";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { OptionItem } from "@/ui/OptionItem";
import { OptionLabel } from "@/ui/OptionLabel";
import { SubmitButton } from "@/ui/SubmitButton";
import { Text } from "@/ui/Text";
import { TextField } from "@/ui/TextField";
import { ToastActions, toast } from "@/ui/Toast";
import { currencySchema } from "@/utils/currencySchema";
import styles from "./styles.module.css";

type Props = {
	recipe: RecipeWithSpecs;
};

export function CreateRecipeEntryDialog({ recipe }: Props) {
	const { handleClose } = useModalContext();
	const formRef = useRef<HTMLFormElement>(null);
	const [withNewList, setWithNewList] = useState(false);

	const { data: lists } = useSWRImmutable<RecipeListWithEntries[] | undefined>(
		"/api/lists",
		recipeListFetcher,
	);

	const { action } = useServerAction(appendRecipeListEntryAction, handleClose);

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

			try {
				const promise = action(formData);

				toast.promise(promise, {
					id: toastId,
					loading: withNewList ? "Creating list…" : "Adding to list…",
					success: (result) => ({
						message: withNewList ? "List created" : "Recipe added to List",
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
			} catch (_e) {}
		},
		[action, withNewList],
	);
	const selectId = useId();

	return (
		<FormProvider context={form.context}>
			<form
				ref={formRef}
				action={handleSubmit}
				onSubmit={form.onSubmit}
				id={form.id}
			>
				<Alert
					onClose={handleClose}
					heading="Add recipe to list"
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

							<SubmitButton
								variant="solid"
								color="heavy"
								size="small"
								disabled={!recipeList.name.value && !recipeList.id.value}
							>
								{recipeList.name.value
									? "Create List with Recipe"
									: "Add Recipe to List"}
							</SubmitButton>
						</>
					}
				>
					<input type="submit" hidden form={form.id} />

					<Grid gap={4}>
						<Grid gap={2}>
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
									id={selectId}
									name={recipeList.id.name}
									defaultValue={recipeList.id.defaultValue}
									required
									inputProps={{
										large: true,
										fullWidth: true,
									}}
									comboboxProps={{
										initialInputValue: recipeList.name.value,
									}}
									renderCreateListItem={({ closeMenu, inputValue }) => (
										<OptionItem
											onClick={() => {
												form.update({
													name: recipeList.name.name,
													value: inputValue.trim(),
												});

												setWithNewList(true);
												closeMenu?.();
											}}
										>
											<OptionLabel description={<i>"{inputValue.trim()}"</i>}>
												Create new List
											</OptionLabel>
										</OptionItem>
									)}
								/>
							)}

							<div>
								<Button
									variant="outline"
									color="light"
									size="tiny"
									onClick={() => {
										const searchValue = document
											.getElementById(selectId)
											?.querySelector<HTMLInputElement>(
												"input[type='search']",
											)?.value;

										if (searchValue) {
											form.update({
												name: recipeList.name.name,
												value: searchValue.trim(),
											});
										}

										setWithNewList((prev) => !prev);
									}}
								>
									{withNewList ? "Use existing List" : "Create new List"}
								</Button>
							</div>

							<Icon name="arrow-up-long" size={6} className={styles.arrow} />
						</Grid>

						{entries.map((entry) => {
							const entryFields = entry.getFieldset();
							const parsedPrice = currencySchema.safeParse(
								entryFields.price.value,
							);

							return (
								<Fragment key={entry.id}>
									<input
										type="hidden"
										name={entryFields.recipeId.name}
										defaultValue={entryFields.recipeId.defaultValue}
									/>

									<Grid className={styles.grid}>
										<RecipeListEntryCard
											className={styles.card}
											entry={{
												id: "",
												orgId: "",
												recipe,
												recipeId: recipe.id,
												listId: recipeList.id.value ?? "",
												price: parsedPrice.success ? parsedPrice.data : null,
												sortOrder: null,
											}}
										>
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
									</Grid>
								</Fragment>
							);
						})}

						<FormErrors formRef={formRef} />
					</Grid>
				</Alert>
			</form>
		</FormProvider>
	);
}
