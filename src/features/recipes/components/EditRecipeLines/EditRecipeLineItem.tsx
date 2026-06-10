"use client";

import { type FieldName, useField } from "@conform-to/react";
import {
	type UseComboboxState,
	type UseComboboxStateChangeOptions,
	useCombobox,
} from "downshift";
import { type ReactNode, use, useMemo } from "react";
import type { RecipeFormData } from "@/db/schema/composite";
import type { Ingredient } from "@/db/schema/ingredients";
import { CATEGORY_DEFAULT_ABV } from "@/features/categories/constants";
import { matchNameWithCategory } from "@/features/categories/utils/matchNameWithCategory";
import { IngredientPicker } from "@/features/ingredients/components/IngredientPicker";
import { DraftIngredientOverview } from "@/features/ingredients/draft/components/DraftIngredientOverview";
import { IngredientDialogForm } from "@/features/ingredients/draft/components/IngredientDialogForm";
import {
	buildIngredientIndex,
	type IngredientIndex,
} from "@/features/ingredients/utils/buildIngredientIndex";
import { QuantityControl } from "@/features/quantity/components/QuantityControl";
import { SelectUnit } from "@/features/units/components/SelectUnit";
import { isValidUnit } from "@/features/units/utils";
import { getMeasurementFromUnit } from "@/features/units/utils/getMeasurementFromUnit";
import { useDialog } from "@/hooks/useDialog";
import { FormatterContext } from "@/hooks/useFormatter";
import { Button } from "@/ui/Button";
import { Checkbox } from "@/ui/Checkbox";
import { Chip } from "@/ui/Chip";
import { Grid } from "@/ui/Grid";
import { Menu } from "@/ui/Menu";
import { Text } from "@/ui/Text";
import { normalizeInput } from "@/utils";
import styles from "./styles.module.css";

type IngredientLine = NonNullable<RecipeFormData["lines"]>[number];

function asString(value: unknown): string {
	return typeof value === "string" ? value : "";
}

/**
 * Commit-on-click-or-commit-key semantics for the ingredient picker:
 * - Typing alone never auto-selects (so "Lime" doesn't lock you out of typing
 *   "Lime Cordial").
 * - Once an item is selected, typing past its name clears the selection.
 * - On blur OR Enter, if the typed text matches an existing ingredient,
 *   auto-select it and snap the input to the canonical name.
 */
function makeIngredientPickerStateReducer(index: IngredientIndex) {
	return (
		state: UseComboboxState<Ingredient>,
		{ type, changes }: UseComboboxStateChangeOptions<Ingredient>,
	): Partial<UseComboboxState<Ingredient>> => {
		if (type === useCombobox.stateChangeTypes.InputChange) {
			if (
				state.selectedItem &&
				normalizeInput(changes.inputValue ?? "") !==
					normalizeInput(state.selectedItem.name)
			) {
				return { ...changes, selectedItem: null };
			}
			return changes;
		}
		if (
			type === useCombobox.stateChangeTypes.InputBlur ||
			type === useCombobox.stateChangeTypes.InputKeyDownEnter
		) {
			const text = changes.inputValue ?? state.inputValue ?? "";
			const matched = index.get(normalizeInput(text));
			if (matched && matched !== state.selectedItem) {
				return { ...changes, selectedItem: matched, inputValue: matched.name };
			}
			return { ...changes, inputValue: text.trim() };
		}
		return changes;
	};
}

export function EditRecipeLineItem({
	name,
	actions,
	ingredients,
	withOptional,
}: {
	name: FieldName<IngredientLine, RecipeFormData>;
	actions?: ReactNode;
	ingredients: Ingredient[];
	withOptional?: boolean;
}) {
	const { dialogRef, showModal } = useDialog();
	const { percentageFormatter } = use(FormatterContext);

	const [field, form] = useField(name);
	const line = field.getFieldset();
	const ingredient = line.ingredient.getFieldset();

	const ingredientIndex = useMemo(
		() => buildIngredientIndex(ingredients),
		[ingredients],
	);

	/**
	 * The combobox's displayed name is the single source of truth for which
	 * ingredient this line refers to. `ingredientId` is derived: if the name
	 * matches an existing ingredient (case-insensitive), the picker's hidden
	 * input emits that id; otherwise it submits empty and the server creates a
	 * new ingredient from the accompanying `ingredient` subtree.
	 */
	const currentName = asString(ingredient.name.value);
	const matchedIngredient = currentName.trim()
		? ingredientIndex.get(normalizeInput(currentName))
		: undefined;
	const isNewIngredient = !matchedIngredient && currentName.trim().length > 0;

	return (
		<li className={styles.item}>
			<input
				type="hidden"
				name={line.id.name}
				value={asString(line.id.value)}
			/>

			<div className={styles.line}>
				<div className={styles.card}>
					<div className={styles.inner}>
						<div className={styles.meta}>
							<QuantityControl
								key={line.quantity.key}
								name={line.quantity.name}
								defaultValue={line.quantity.initialValue}
								compact
								className={styles.quantity}
							/>

							<SelectUnit
								key={line.unit.key}
								name={line.unit.name}
								defaultValue={line.unit.initialValue}
								placeholder="Unit"
								compact
								rounded
								className={styles.unit}
								buttonProps={{
									className: styles.unitButton,
								}}
							/>
						</div>

						<div className={styles.ingredient}>
							<IngredientPicker
								className={styles.ingredientPicker}
								ingredients={ingredients}
								name={line.ingredientId.name}
								defaultValue={
									ingredientIndex.get(
										normalizeInput(asString(ingredient.name.initialValue)),
									)?.id
								}
								toggleButtonProps={{
									className: styles.ingredientInput,
								}}
								comboboxProps={{
									inputValue: currentName,
									stateReducer:
										makeIngredientPickerStateReducer(ingredientIndex),
									onInputValueChange: ({ inputValue }) => {
										form.update({
											name: ingredient.name.name,
											value: inputValue,
										});
									},
									onSelectedItemChange: ({ selectedItem }) => {
										if (!selectedItem) return;
										form.update({
											name: ingredient.name.name,
											value: selectedItem.name,
										});
									},
								}}
								inputProps={{
									compact: true,
									rounded: true,
									className: styles.ingredientInput,
									placeholder: "Ingredient",
									"aria-invalid": !ingredient.name.valid,
								}}
								renderCreateListItem={({ closeMenu, inputValue }) => (
									<Menu.Item
										onClick={() => {
											closeMenu?.();
											const trimmed = inputValue.trim();
											const category = matchNameWithCategory(trimmed);
											const abv = category
												? CATEGORY_DEFAULT_ABV.get(category)
												: undefined;
											const measurementType = isValidUnit(line.unit.value)
												? (getMeasurementFromUnit(line.unit.value) ?? "")
												: "";

											form.update({
												name: line.ingredient.name,
												value: {
													name: trimmed,
													description: "",
													brand: "",
													unitCost: "",
													category: category ?? "",
													measurementType,
													abv: abv ? percentageFormatter.format(abv) : "",
												},
											});
											showModal();
										}}
									>
										<Menu.Label description={<i>"{currentName.trim()}"</i>}>
											Create new ingredient
										</Menu.Label>
									</Menu.Item>
								)}
							/>
						</div>
					</div>

					{isNewIngredient ? (
						<details className={styles.newInfo}>
							<Text as="summary" size={1} compact>
								<Text className={styles.ingredientName} heavy>
									New ingredient: <b>{currentName.trim()}</b>
								</Text>{" "}
								<Chip size={0} color="regular">
									New
								</Chip>
							</Text>

							<Grid gap={2} justifyContent="start">
								<DraftIngredientOverview name={line.ingredient.name} />

								<div>
									<Button
										variant="outline"
										color="accent"
										size="tiny"
										onClick={showModal}
									>
										Edit ingredient data
									</Button>
								</div>
							</Grid>
						</details>
					) : null}

					{/**
					 * Always mount the dialog's content so its `ingredient.*` inputs are
					 * present in `FormData`. Conform's `MutationObserver` listens for
					 * `name`-attribute mutations (which React triggers on every render)
					 * and rebuilds `meta.value` from `FormData` — fields not in the DOM
					 * at that moment get wiped. Keeping the dialog content mounted (the
					 * `<dialog>` element itself stays visually closed until `showModal()`)
					 * ensures the ingredient subtree survives that rebuild.
					 */}
					<IngredientDialogForm
						name={line.ingredient.name}
						ref={dialogRef}
						isOpen
					/>
				</div>

				{actions ? <div className={styles.actions}>{actions}</div> : null}
			</div>

			{withOptional ? (
				<Checkbox
					key={line.optional.key}
					name={line.optional.name}
					defaultChecked={line.optional.defaultChecked}
					id={line.optional.id}
					label="Optional"
					size="small"
					className={styles.optional}
				/>
			) : null}
		</li>
	);
}
