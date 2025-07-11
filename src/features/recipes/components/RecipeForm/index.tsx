"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useActionState, useRef } from "react";
import { recipeFormSchema } from "@/db/schema/composite";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { upsertRecipeWithSpecsAction } from "@/features/recipes/actions/upsertRecipeWithSpecs";
import { PreviewDraftRecipe } from "@/features/recipes/components/PreviewDraftRecipe";
import { SelectCocktailStyle } from "@/features/recipes/components/SelectCocktailStyle";
import { SelectDilution } from "@/features/recipes/components/SelectDilution";
import { SelectGlassware } from "@/features/recipes/components/SelectGlassware";
import { SelectPreparationMethod } from "@/features/recipes/components/SelectPreparationMethod";
import { METHOD_TO_DEFAULT_DILUTION } from "@/features/recipes/constants";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { TextField } from "@/ui/TextField";
import styles from "./styles.module.css";

type Props = {
	recipe: RecipeWithSpecs;
};

export function RecipeForm({ recipe }: Props) {
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
				<input type="hidden" name="recipe.id" value={recipe.id} />

				<Grid gap={4}>
					<TextField
						label="Name"
						name="recipe.name"
						required
						defaultValue={recipeFields.name.initialValue}
					/>

					<SelectCocktailStyle
						label="Style"
						name="recipe.style"
						defaultValue={recipeFields.style.initialValue}
					/>

					<TextField
						as="textarea"
						label="Description"
						name="recipe.description"
						defaultValue={recipeFields.description.initialValue}
						helperText="Brief information about the recipe"
					/>

					<TextField
						as="textarea"
						label="Instructions"
						name="recipe.instructions"
						defaultValue={recipeFields.instructions.initialValue}
						helperText="Preparation instructions and notes"
					/>

					<SelectPreparationMethod
						label="Preparation method"
						name="recipe.preparationMethod"
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
						name="recipe.dilutionTarget"
						defaultValue={recipeFields.dilutionTarget.initialValue}
					/>

					<SelectGlassware
						label="Glassware"
						name="recipe.glassware"
						defaultValue={recipeFields.glassware.initialValue}
					/>

					<TextField
						label="Garnish"
						name="recipe.garnish"
						defaultValue={recipeFields.garnish.initialValue}
					/>

					<div>
						<SubmitButton variant="solid" color="accent">
							<Icon name="circle-check" />
							Save
						</SubmitButton>
					</div>
				</Grid>

				<aside>
					<PreviewDraftRecipe formRef={formRef} />
				</aside>
			</form>
		</FormProvider>
	);
}
