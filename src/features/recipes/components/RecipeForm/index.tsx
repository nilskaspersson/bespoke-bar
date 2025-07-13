"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useActionState, useRef } from "react";
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
import { ControlLabel } from "@/ui/ControlLabel";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { TextField } from "@/ui/TextField";
import styles from "./styles.module.css";

type Props = {
	recipe: RecipeWithSpecs;
	ingredients: Ingredient[];
};

export function RecipeForm({ recipe, ingredients }: Props) {
	const [state, formAction] = useActionState(upsertRecipeWithSpecsAction, null);

	const [form, fields] = useForm({
		id: recipe?.id ? `recipe-form-${recipe.id}` : "new-recipe-form",
		lastResult: state,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: recipeFormSchema,
			});
		},
		defaultValue: {
			recipe,
			specs: recipe.specs.map((spec) => ({
				quantity: spec.quantity?.toString() ?? null,
				unit: spec.unit,
				ingredientId: spec.ingredientId,
				ingredient: {
					name: spec.ingredient.name,
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
				<input type="hidden" name={recipeFields.id.name} value={recipe.id} />

				<Grid gap={4}>
					<TextField
						label="Name"
						name={recipeFields.name.name}
						required
						defaultValue={recipeFields.name.initialValue}
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
						defaultValue={recipeFields.description.initialValue}
						helperText="Brief information about the recipe"
					/>

					<TextField
						as="textarea"
						label="Instructions"
						name={recipeFields.instructions.name}
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
						defaultValue={recipeFields.garnish.initialValue}
					/>

					<div>
						<SubmitButton variant="solid" color="accent">
							<Icon name="circle-check" />
							Save
						</SubmitButton>
					</div>
				</Grid>
			</form>
		</FormProvider>
	);
}
