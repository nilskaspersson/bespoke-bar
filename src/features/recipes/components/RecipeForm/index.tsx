"use client";

import type { SubmissionResult } from "@conform-to/dom";
import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useRouter } from "next/navigation";
import { type ReactNode, use, useRef, useState } from "react";
import { BottomRailItems } from "@/components/BottomRail";
import { type RecipeFormData, recipeFormSchema } from "@/db/schema/composite";
import type { Ingredient } from "@/db/schema/ingredients";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import type { SpecWithIngredient } from "@/db/schema/specs";
import { showRecipeLimitReachedToast } from "@/features/billing/components/RecipeLimitReachedToast";
import { RecipeSlotUsageContext } from "@/features/billing/components/RecipeSlotUsageProvider";
import { upsertRecipeWithSpecsAction } from "@/features/recipes/api/upsertRecipesWithSpecs";
import { EditRecipeSpecs } from "@/features/recipes/components/EditRecipeSpecs";
import { RecipeFormSettings } from "@/features/recipes/components/RecipeFormSettings";
import { SelectCocktailStyle } from "@/features/recipes/components/SelectCocktailStyle";
import { SelectDilution } from "@/features/recipes/components/SelectDilution";
import { SelectGlassware } from "@/features/recipes/components/SelectGlassware";
import { SelectPreparationMethod } from "@/features/recipes/components/SelectPreparationMethod";
import { METHOD_TO_DEFAULT_DILUTION } from "@/features/recipes/constants";
import { getRecipeUrl } from "@/features/recipes/utils";
import { Button } from "@/ui/Button";
import { FormErrors } from "@/ui/FormErrors";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { Kbd } from "@/ui/Kbd";
import { Text } from "@/ui/Text";
import { TextField } from "@/ui/TextField";
import { toast } from "@/ui/Toast";
import styles from "./styles.module.css";

type Props = {
	recipe?: RecipeWithSpecs;
	ingredients: Ingredient[];
	children?: ReactNode;
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

export function RecipeForm({ recipe, ingredients, children }: Props) {
	const router = useRouter();
	const isNew = !recipe?.id;
	const usage = use(RecipeSlotUsageContext);

	const [lastResult, setLastResult] = useState<SubmissionResult>();
	const [submitting, setSubmitting] = useState(false);

	const [form, fields] = useForm<RecipeFormData>({
		id: recipe?.id ? `recipe-form-${recipe.id}` : "new-recipe-form",
		lastResult,
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
		async onSubmit(event, { formData }) {
			event.preventDefault();

			if (isNew && usage && usage.remaining <= 0) {
				showRecipeLimitReachedToast(usage);
				return;
			}

			setSubmitting(true);
			const { result, recipes } = await upsertRecipeWithSpecsAction(formData);
			setSubmitting(false);
			setLastResult(result);

			if (result.status === "error") {
				toast.error("Could not save changes", {
					description: "Check the form for issues and try again.",
				});
				return;
			}

			toast.success(isNew ? "Recipe created" : "Changes saved");

			if (recipes?.length === 1) {
				router.push(getRecipeUrl(recipes[0]));
			}
		},
	});

	const recipeFields = fields.recipe.getFieldset();

	const formRef = useRef<HTMLFormElement>(null);

	const initialOptional = recipe?.specs.some((spec) => spec.optional) ?? false;
	const [withOptionalSpecs, setWithOptionalSpecs] = useState(initialOptional);

	return (
		<FormProvider context={form.context}>
			<div className={styles.layout}>
				<Grid
					as="form"
					gap={6}
					ref={formRef}
					id={form.id}
					onSubmit={form.onSubmit}
					onReset={() => {
						setWithOptionalSpecs(initialOptional);
					}}
					noValidate
					autoComplete="off"
					className={styles.form}
				>
					<input
						type="hidden"
						name={recipeFields.id.name}
						value={recipeFields.id.value ?? ""}
					/>

					<EditRecipeSpecs
						id={fields.specs.id}
						name="specs"
						ingredients={ingredients}
						withOptional={withOptionalSpecs}
					/>

					<div className={styles.box}>
						<TextField
							label="Recipe name"
							key={recipeFields.name.key}
							name={recipeFields.name.name}
							defaultValue={recipeFields.name.initialValue}
							id={recipeFields.name.id}
							placeholder="Name your creation…"
						/>

						<SelectPreparationMethod
							label="Preparation method"
							key={recipeFields.preparationMethod.key}
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
							key={recipeFields.dilutionTarget.key}
							name={recipeFields.dilutionTarget.name}
							defaultValue={recipeFields.dilutionTarget.initialValue}
						/>

						<details>
							<Text as="summary" heavy compact weight={600}>
								Style, description, instructions, glassware, garnish…
							</Text>

							<Grid as="fieldset" gap={6} className={styles.fieldset}>
								<SelectCocktailStyle
									label="Style"
									key={recipeFields.style.key}
									name={recipeFields.style.name}
									defaultValue={recipeFields.style.initialValue}
								/>

								<TextField
									as="textarea"
									label="Description"
									key={recipeFields.description.key}
									name={recipeFields.description.name}
									id={recipeFields.description.id}
									defaultValue={recipeFields.description.initialValue}
									helperText="Brief information about the recipe"
								/>

								<TextField
									as="textarea"
									label="Instructions"
									key={recipeFields.instructions.key}
									name={recipeFields.instructions.name}
									id={recipeFields.instructions.id}
									defaultValue={recipeFields.instructions.initialValue}
									helperText="Preparation instructions and notes"
								/>

								<SelectGlassware
									label="Glassware"
									key={recipeFields.glassware.key}
									name={recipeFields.glassware.name}
									defaultValue={recipeFields.glassware.initialValue}
								/>

								<TextField
									label="Garnish"
									key={recipeFields.garnish.key}
									name={recipeFields.garnish.name}
									id={recipeFields.garnish.id}
									defaultValue={recipeFields.garnish.initialValue}
								/>
							</Grid>
						</details>

						<FormErrors formRef={formRef} />
					</div>
				</Grid>

				{children}
			</div>

			<BottomRailItems>
				<RecipeFormSettings
					optional={withOptionalSpecs}
					onOptionalChange={setWithOptionalSpecs}
					formId={form.id}
				/>

				<Button
					type="button"
					variant="clear"
					color="accent"
					rounded
					disabled={submitting}
					onClick={() => {
						formRef.current?.requestSubmit();
					}}
					endAdornment={
						<Kbd
							shortcut="mod+enter"
							variant="ghost"
							ignoreInputEvents={false}
						/>
					}
				>
					<Icon name="circle-check" />
					{recipeFields.id.value ? "Save changes" : "Create recipe"}
				</Button>
			</BottomRailItems>
		</FormProvider>
	);
}
