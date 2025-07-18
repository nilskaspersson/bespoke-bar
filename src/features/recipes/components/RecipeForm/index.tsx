"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useActionState, useContext, useRef } from "react";
import { recipeFormSchema } from "@/db/schema/composite";
import type { Ingredient } from "@/db/schema/ingredients";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { upsertRecipeWithSpecsAction } from "@/features/recipes/actions/upsertRecipeWithSpecs";
import { EditRecipeSpecs } from "@/features/recipes/components/EditRecipeSpecs";
import { SelectCocktailStyle } from "@/features/recipes/components/SelectCocktailStyle";
import { SelectDilution } from "@/features/recipes/components/SelectDilution";
import { SelectGlassware } from "@/features/recipes/components/SelectGlassware";
import { SelectPreparationMethod } from "@/features/recipes/components/SelectPreparationMethod";
import { METHOD_TO_DEFAULT_DILUTION } from "@/features/recipes/constants";
import { FormatterContext } from "@/hooks/useFormatter";
import { Button } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { ControlLabel } from "@/ui/ControlLabel";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { Text } from "@/ui/Text";
import { TextField } from "@/ui/TextField";
import { focusFieldByName } from "@/utils/form";
import styles from "./styles.module.css";

type Props = {
	recipe: RecipeWithSpecs;
	ingredients: Ingredient[];
};

export function RecipeForm({ recipe, ingredients }: Props) {
	const [state, formAction] = useActionState(upsertRecipeWithSpecsAction, null);
	const { percentageFormatter } = useContext(FormatterContext);

	const [form, fields] = useForm({
		id: recipe?.id ? `recipe-form-${recipe.id}` : "new-recipe-form",
		lastResult: state,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: recipeFormSchema,
			});
		},
		shouldValidate: "onSubmit",
		shouldRevalidate: "onInput",
		defaultValue: {
			recipe: {
				...recipe,
				dilutionTarget: recipe.dilutionTarget ?? percentageFormatter.format(0),
			},
			specs: recipe.specs.map((spec) => ({
				quantity: spec.quantity?.toString() ?? null,
				unit: spec.unit,
				optional: spec.optional,
				ingredientId: spec.ingredientId,
				ingredient: {
					name: spec.ingredient.name,
					description: spec.ingredient.description,
					abv: spec.ingredient.abv
						? percentageFormatter.format(spec.ingredient.abv)
						: undefined,
					brand: spec.ingredient.brand,
					category: spec.ingredient.category,
					measurementType: spec.ingredient.measurementType,
					unitCost: spec.ingredient.unitCost
						? String(spec.ingredient.unitCost)
						: "",
				},
			})),
		},
	});

	const recipeFields = fields.recipe.getFieldset();

	const formRef = useRef<HTMLFormElement>(null);

	return (
		<FormProvider context={form.context}>
			<form
				action={formAction}
				ref={formRef}
				id={form.id}
				onSubmit={form.onSubmit}
				noValidate
				className={styles.form}
			>
				{/**
				 * A native form submit (f.e. enter in form) looks for the first submit button of a
				 * form and invokes that. Since we use conform for progressive enhancement with
				 * alternative submit buttons with an expressed intent ("validate", "remove",
				 * "insert"), we need to ensure the actual submit action is handled.
				 */}
				<input type="submit" hidden form={form.id} />
				<input type="hidden" name={recipeFields.id.name} value={recipe.id} />

				<TextField
					label="Name"
					name={recipeFields.name.name}
					defaultValue={recipeFields.name.initialValue}
					id={recipeFields.name.id}
				/>

				<ControlLabel
					htmlFor={fields.specs.name}
					id={fields.specs.id}
					label="Specs"
					required
				>
					<EditRecipeSpecs
						id={fields.specs.id}
						name="specs"
						ingredients={ingredients}
					/>
				</ControlLabel>

				<SelectCocktailStyle
					label="Style"
					name={recipeFields.style.name}
					defaultValue={recipeFields.style.initialValue}
				/>

				<TextField
					as="textarea"
					label="Description"
					name={recipeFields.description.name}
					id={recipeFields.description.id}
					defaultValue={recipeFields.description.initialValue}
					helperText="Brief information about the recipe"
				/>

				<TextField
					as="textarea"
					label="Instructions"
					name={recipeFields.instructions.name}
					id={recipeFields.instructions.id}
					defaultValue={recipeFields.instructions.initialValue}
					helperText="Preparation instructions and notes"
				/>

				<SelectPreparationMethod
					label="Preparation method"
					name={recipeFields.preparationMethod.name}
					defaultValue={recipeFields.preparationMethod.initialValue}
					selectProps={{
						onSelectedItemChange: ({ selectedItem }) => {
							if (!selectedItem) {
								return;
							}

							form.update({
								name: "recipe.dilutionTarget",
								value: METHOD_TO_DEFAULT_DILUTION.get(selectedItem.value),
							});
						},
					}}
				/>

				<SelectDilution
					name={recipeFields.dilutionTarget.name}
					defaultValue={recipeFields.dilutionTarget.initialValue}
				/>

				<SelectGlassware
					label="Glassware"
					name={recipeFields.glassware.name}
					defaultValue={recipeFields.glassware.initialValue}
				/>

				<TextField
					label="Garnish"
					name={recipeFields.garnish.name}
					id={recipeFields.garnish.id}
					defaultValue={recipeFields.garnish.initialValue}
				/>

				{Object.keys(form.allErrors).length > 0 ? (
					<Callout color="red" size={2} heading="Issues">
						<Text list as="ul">
							{Object.entries(form.allErrors).map(([field, error]) => (
								<li key={field}>
									<Button
										variant="base"
										onClick={() => {
											focusFieldByName(formRef.current, field);
										}}
									>
										{error}
									</Button>
								</li>
							))}
						</Text>
					</Callout>
				) : null}

				<div>
					<SubmitButton variant="solid" color="accent" form={form.id}>
						<Icon name="circle-check" />
						Save
					</SubmitButton>
				</div>
			</form>
		</FormProvider>
	);
}
