"use client";

import { type FieldName, useField } from "@conform-to/react";
import { type ReactNode, useId, useRef } from "react";
import type { RecipeFormData } from "@/db/schema/composite";
import type { Ingredient } from "@/db/schema/ingredients";
import { CATEGORY_DEFAULT_ABV } from "@/features/categories/constants";
import { matchNameWithCategory } from "@/features/categories/utils/matchNameWithCategory";
import { IngredientPicker } from "@/features/ingredients/components/IngredientPicker";
import { DraftIngredientOverview } from "@/features/ingredients/draft/components/DraftIngredientOverview";
import { IngredientDialogForm } from "@/features/ingredients/draft/components/IngredientDialogForm";
import { QuantityControl } from "@/features/quantity/components/QuantityControl";
import { SelectUnit } from "@/features/units/components/SelectUnit";
import { isValidUnit } from "@/features/units/utils";
import { getMeasurementFromUnit } from "@/features/units/utils/getMeasurementFromUnit";
import { useFormatter } from "@/hooks/useFormatter";
import { Button } from "@/ui/Button";
import { Checkbox } from "@/ui/Checkbox";
import { Chip } from "@/ui/Chip";
import { Grid } from "@/ui/Grid";
import { OptionItem } from "@/ui/OptionItem";
import { OptionLabel } from "@/ui/OptionLabel";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

type Spec = NonNullable<RecipeFormData["specs"]>[number];

export function EditRecipeSpecItem({
	name,
	actions,
	ingredients,
	withOptional,
}: {
	name: FieldName<Spec, RecipeFormData>;
	actions?: ReactNode;
	ingredients: Ingredient[];
	withOptional?: boolean;
}) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const { percentageFormatter } = useFormatter();

	const searchName = useId();
	const [searchField] = useField<string>(searchName);

	const [field, form] = useField(name);
	const spec = field.getFieldset();
	const ingredient = spec.ingredient.getFieldset();

	const newIngredientName = searchField.value?.trim() ?? "";

	const isNewIngredient =
		newIngredientName &&
		!spec.ingredientId.value &&
		!ingredients.some((o) => o.name === newIngredientName);

	return (
		<li className={styles.item}>
			<input
				type="hidden"
				name={spec.id.name}
				value={spec.id.defaultValue ?? spec.id.value}
			/>

			<div className={styles.line}>
				<div className={styles.card}>
					<div className={styles.inner}>
						<div className={styles.meta}>
							<QuantityControl
								name={spec.quantity.name}
								defaultValue={spec.quantity.defaultValue}
								compact
								className={styles.quantity}
							/>

							<SelectUnit
								name={spec.unit.name}
								defaultValue={spec.unit.defaultValue}
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
								name={spec.ingredientId.name}
								defaultValue={spec.ingredientId.defaultValue}
								toggleButtonProps={{
									className: styles.ingredientInput,
								}}
								comboboxProps={{
									onInputValueChange: ({ inputValue }) => {
										form.update({
											name: ingredient.name.name,
											value: inputValue.trim(),
										});
									},
								}}
								inputProps={{
									name: searchName,
									compact: true,
									rounded: true,
									className: styles.ingredientInput,
									placeholder: "Ingredient",
									"aria-invalid": !ingredient.name.valid,
								}}
								renderCreateListItem={({ closeMenu, inputValue }) => (
									<OptionItem
										onClick={() => {
											closeMenu?.();

											form.update({
												name: ingredient.name.name,
												value: inputValue.trim(),
											});

											if (isValidUnit(spec.unit.value)) {
												form.update({
													name: ingredient.measurementType.name,
													value: getMeasurementFromUnit(spec.unit.value) ?? "",
												});
											}

											const category = matchNameWithCategory(inputValue.trim());

											if (category) {
												form.update({
													name: ingredient.category.name,
													value: category,
												});

												const abv = CATEGORY_DEFAULT_ABV.get(category);

												form.update({
													name: ingredient.abv.name,
													value: abv
														? percentageFormatter.format(abv)
														: undefined,
												});
											}

											dialogRef.current?.showModal();
										}}
									>
										<OptionLabel description={<i>"{newIngredientName}"</i>}>
											Create new ingredient
										</OptionLabel>
									</OptionItem>
								)}
							/>
						</div>
					</div>

					{isNewIngredient ? (
						<details className={styles.newInfo}>
							<Text as="summary" size={1} compact>
								<Text className={styles.ingredientName} heavy>
									New ingredient: <b>{newIngredientName}</b>
								</Text>{" "}
								<Chip size={0} color="regular">
									New
								</Chip>
							</Text>

							<Grid gap={2} justifyContent="start">
								<DraftIngredientOverview name={spec.ingredient.name} />

								<div>
									<Button
										variant="outline"
										color="accent"
										size="tiny"
										onClick={() => dialogRef.current?.showModal()}
									>
										Edit ingredient data
									</Button>
								</div>
							</Grid>
						</details>
					) : null}

					<IngredientDialogForm
						name={spec.ingredient.name}
						ref={dialogRef}
						onClose={() => {
							/**
							 * Keep Combobox search in sync with the ingredient name. There is an unwanted
							 * behaviour where the Combobox updates its search value when the control is
							 * focused again. I cannot find a way to prevent this.
							 */
							form.update({
								name: searchName,
								value: field.getFieldset().ingredient.getFieldset().name.value,
							});
						}}
					/>
				</div>

				{actions ? <div className={styles.actions}>{actions}</div> : null}
			</div>

			{withOptional ? (
				<Checkbox
					name={spec.optional.name}
					defaultChecked={spec.optional.defaultChecked}
					id={spec.optional.id}
					label="Optional"
					size="small"
					className={styles.optional}
				/>
			) : null}
		</li>
	);
}
