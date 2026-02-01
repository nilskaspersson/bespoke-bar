"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useCallback, useRef } from "react";
import { type RecipeFormData, recipeFormSchema } from "@/db/schema/composite";
import type { Ingredient } from "@/db/schema/ingredients";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import type { SpecWithIngredient } from "@/db/schema/specs";
import { upsertRecipeWithSpecsAction } from "@/features/recipes/api/upsertRecipesWithSpecs";
import { EditRecipeSpecs } from "@/features/recipes/components/EditRecipeSpecs";
import { SelectCocktailStyle } from "@/features/recipes/components/SelectCocktailStyle";
import { SelectDilution } from "@/features/recipes/components/SelectDilution";
import { SelectGlassware } from "@/features/recipes/components/SelectGlassware";
import { SelectPreparationMethod } from "@/features/recipes/components/SelectPreparationMethod";
import { METHOD_TO_DEFAULT_DILUTION } from "@/features/recipes/constants";
import { useServerAction } from "@/hooks/useServerAction";
import { ControlLabel } from "@/ui/ControlLabel";
import { FormErrors } from "@/ui/FormErrors";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { Text } from "@/ui/Text";
import { TextField } from "@/ui/TextField";
import { toast } from "@/ui/Toast";
import { mutateSWRBarRecipesCache } from "@/utils/swrCache";
import styles from "./styles.module.css";

type Props = {
	recipe?: RecipeWithSpecs;
	ingredients: Ingredient[];
};

function initializeSpecFormEntry(spec?: SpecWithIngredient) {
	return {
		quantity: spec?.quantity?.toString() ?? "1",
		unit: spec?.unit ?? "cl",
		optional: spec?.optional,
		ingredientId: spec?.ingredientId,
		ingredient: {
			name: spec?.ingredient.name,
			description: spec?.ingredient.description,
			abv: spec?.ingredient.abv,
			brand: spec?.ingredient.brand,
			category: spec?.ingredient.category,
			measurementType: spec?.ingredient.measurementType,
			unitCost: spec?.ingredient.unitCost
				? String(spec?.ingredient.unitCost)
				: "",
		},
	};
}

export function RecipeForm({ recipe, ingredients }: Props) {
	const { action } = useServerAction(
		upsertRecipeWithSpecsAction,
		mutateSWRBarRecipesCache,
	);

	const handleSubmit = useCallback(
		async (formData: FormData) => {
			const toastId = Date.now().toString();

			try {
				const promise = action(formData);

				toast.promise(promise, {
					id: toastId,
					loading: "Saving changes…",
					success: () => ({
						message: "Changes saved",
					}),
					error: () => ({
						message: "Could not save changes",
						description: "Try again later.",
					}),
				});
			} catch (_e) {}
		},
		[action],
	);

	const [form, fields] = useForm<RecipeFormData>({
		id: recipe?.id ? `recipe-form-${recipe.id}` : "new-recipe-form",
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
				dilutionTarget: recipe?.dilutionTarget ?? 0,
			},
			specs: recipe?.specs.map(initializeSpecFormEntry) ?? [
				initializeSpecFormEntry(),
			],
		},
	});

	const recipeFields = fields.recipe.getFieldset();

	const formRef = useRef<HTMLFormElement>(null);

	return (
		<FormProvider context={form.context}>
			<Grid
				as="form"
				action={handleSubmit}
				ref={formRef}
				id={form.id}
				onSubmit={form.onSubmit}
				noValidate
				className={styles.container}
			>
				{/**
				 * A native form submit (f.e. enter in form) looks for the first submit button of a
				 * form and invokes that. Since we use conform for progressive enhancement with
				 * alternative submit buttons with an expressed intent ("validate", "remove",
				 * "insert"), we need to ensure the actual submit action is handled.
				 */}
				<input type="submit" hidden form={form.id} />

				<input
					type="hidden"
					name={recipeFields.id.name}
					value={recipeFields.id.value}
				/>

				<TextField
					label="Recipe name"
					name={recipeFields.name.name}
					defaultValue={recipeFields.name.initialValue}
					id={recipeFields.name.id}
					large
				/>

				<hr className={styles.hr} />

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

				<hr className={styles.hr} />

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
					defaultValue={recipeFields.dilutionTarget.defaultValue}
				/>

				<hr className={styles.hr} />

				<details>
					<Text as="summary" heavy compact weight={600}>
						Style, description, instructions, glassware, garnish…
					</Text>

					<Grid as="fieldset" gap={6} className={styles.fieldset}>
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
					</Grid>
				</details>

				<FormErrors formRef={formRef} />
			</Grid>

			<SubmitButton
				variant="solid"
				color="accent"
				form={form.id}
				rounded
				className={styles.submit}
			>
				<Icon name="circle-check" />
				{recipeFields.id.value ? "Save changes" : "Create recipe"}
			</SubmitButton>
		</FormProvider>
	);
}
