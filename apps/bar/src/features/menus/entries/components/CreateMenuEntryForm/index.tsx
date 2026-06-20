"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useCallback, useMemo, useRef, useState } from "react";
import { menuWithEntriesFormSchema } from "@/db/schema/composite";
import type { MenuEntryWithRecipe } from "@/db/schema/menuEntries";
import type { RecipeWithLines } from "@/db/schema/recipes";
import { RemoveMenuEntryButton } from "@/features/menus/actions/components/RemoveMenuEntryButton";
import { SelectMenu } from "@/features/menus/components/SelectMenu";
import { appendMenuEntryAction } from "@/features/menus/entries/api/appendMenuEntry";
import { removeRecipeFromMenu } from "@/features/menus/entries/api/removeRecipeFromMenu";
import { MenuEntryNameAdornment } from "@/features/menus/entries/components/MenuEntryNameAdornment";
import { MenuEntryPriceCalculation } from "@/features/menus/entries/components/MenuEntryPriceCalculation";
import {
	createDraftMenuEntry,
	getMenuName,
	isMenu,
	isMenuWithEntries,
} from "@/features/menus/utils";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { trpc } from "@/trpc/client";
import { Button, LinkButton } from "@/ui/Button";
import { CurrencyInput } from "@/ui/CurrencyInput";
import { FormErrors } from "@/ui/FormErrors";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { Menu } from "@/ui/Menu";
import { Skeleton } from "@/ui/Skeleton";
import { Text } from "@/ui/Text";
import { TextField } from "@/ui/TextField";
import { ToastActions, toast } from "@/ui/Toast";
import { currencySchema } from "@/utils/currencySchema";
import styles from "./styles.module.css";

type Props = {
	recipe: RecipeWithLines;
	onSuccess?: () => void;
	formRef?: React.RefObject<HTMLFormElement | null>;
};

export function CreateMenuEntryForm({ recipe, onSuccess, formRef }: Props) {
	const internalFormRef = useRef<HTMLFormElement>(null);
	const resolvedFormRef = formRef ?? internalFormRef;

	const [withNewMenu, setWithNewMenu] = useState(false);
	const [comboboxInputValue, setComboboxInputValue] = useState("");

	const { data: menus } = trpc.menu.list.useQuery();

	const [form, fields] = useForm({
		id: `create-recipe-entry-${recipe.id}`,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: menuWithEntriesFormSchema,
			});
		},
		defaultValue: {
			menu: {
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
	const menu = fields.menu.getFieldset();

	const handleSubmit = useCallback(
		async (formData: FormData) => {
			const toastId = Date.now().toString();

			const promise = appendMenuEntryAction(formData);

			toast.promise(promise, {
				id: toastId,
				loading: withNewMenu ? "Creating menu…" : "Adding to menu…",
				success: (result) => ({
					message: !isMenu(result) ? (
						"Unknown error"
					) : withNewMenu ? (
						<>
							Menu <em>"{getMenuName(result)}"</em> created
						</>
					) : (
						<>
							Recipe added to <em>"{getMenuName(result)}"</em>
						</>
					),
					action: isMenuWithEntries(result) ? (
						<ToastActions>
							<RemoveMenuEntryButton
								size="tiny"
								variant="ghost"
								color="heavy"
								actionRemove={removeRecipeFromMenu}
								entry={result.entries[0]}
								onClick={() => toast.dismiss(toastId)}
							>
								Undo
							</RemoveMenuEntryButton>

							<LinkButton
								size="tiny"
								href={`/bar/menus/${result.id}`}
								variant="ghost"
								color="heavy"
								prefetch={false}
								onClick={() => toast.dismiss(toastId)}
							>
								View Menu
								<Icon name="angles-right" size={0} />
							</LinkButton>
						</ToastActions>
					) : null,
				}),
				error: (error) => ({
					message:
						error instanceof Error
							? error.message
							: "Recipe could not be added to Menu.",
				}),
			});

			await promise;
			onSuccess?.();
		},
		[withNewMenu, onSuccess],
	);

	// Since we only have one entry (the current recipe), get the first entry's fields
	const firstEntry = entries[0];
	const entryFields = firstEntry?.getFieldset();
	const parsedPrice = currencySchema.safeParse(entryFields?.price.value);

	const draftEntry: MenuEntryWithRecipe | null = useMemo(
		() =>
			createDraftMenuEntry({
				recipe,
				recipeId: recipe.id,
				menuId: menu.id.value ?? "",
				price: parsedPrice.success ? parsedPrice.data : null,
			}),
		[recipe, menu.id.value, parsedPrice.success, parsedPrice.data],
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
					{firstEntry && entryFields && draftEntry ? (
						<div key={firstEntry.id}>
							<input
								type="hidden"
								name={entryFields.recipeId.name}
								defaultValue={entryFields.recipeId.defaultValue}
							/>

							<div className={styles.card}>
								<RecipeCard
									recipe={draftEntry.recipe}
									nameAdornment={<MenuEntryNameAdornment entry={draftEntry} />}
								/>
							</div>

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

									<MenuEntryPriceCalculation
										price={entryFields.price.value}
										recipe={recipe}
										priceInputId={entryFields.price.id}
									/>
								</Grid>
							</details>
						</div>
					) : null}

					<Icon name="arrow-down" size={6} className={styles.arrow} />

					<Grid gap={2}>
						{withNewMenu ? (
							<TextField
								label="New Menu name"
								name={menu.name.name}
								defaultValue={menu.name.defaultValue}
								id={menu.name.id}
								required
								large
								fullWidth
								autoFocus
							/>
						) : (
							<SelectMenu
								label="Menu"
								menus={menus}
								name={menu.id.name}
								defaultValue={menu.id.defaultValue}
								required
								inputProps={{
									large: true,
									fullWidth: true,
								}}
								comboboxProps={{
									initialInputValue: menu.name.value,
									onInputValueChange: ({ inputValue }) => {
										setComboboxInputValue(inputValue);
									},
								}}
								renderCreateListItem={({ closeMenu, inputValue }) => (
									<Menu.Item
										onClick={() => {
											form.update({
												name: menu.name.name,
												value: inputValue.trim(),
											});

											setWithNewMenu(true);
											closeMenu?.();
										}}
									>
										<Menu.Label description={<i>"{inputValue.trim()}"</i>}>
											Create new Menu
										</Menu.Label>
									</Menu.Item>
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
											name: menu.name.name,
											value: comboboxInputValue.trim(),
										});
									}

									setWithNewMenu((prev) => !prev);
								}}
							>
								{withNewMenu ? "Use existing Menu" : "Create new Menu"}
							</Button>
						</div>
					</Grid>

					<FormErrors formRef={resolvedFormRef} />
				</Grid>
			</form>
		</FormProvider>
	);
}

export function CreateMenuEntryFormSkeleton() {
	return (
		<Grid gap={4} className={styles.grid}>
			<Skeleton variant="block" width="513px" height="204px" />

			<Icon name="arrow-down" size={6} className={styles.arrow} />

			<Grid gap={2}>
				<Skeleton variant="block" width="513px" height="152px" />
			</Grid>
		</Grid>
	);
}

CreateMenuEntryForm.Skeleton = CreateMenuEntryFormSkeleton;
