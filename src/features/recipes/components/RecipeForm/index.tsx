"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useActionState } from "react";
import { type RecipeWithSpecs, updateRecipeSchema } from "@/db/schema/recipes";
import { updateRecipeAction } from "@/features/recipes/actions/updateRecipe";
import { SelectCocktailStyle } from "@/features/recipes/components/SelectCocktailStyle";
import { SelectDilution } from "@/features/recipes/components/SelectDilution";
import { SelectGlassware } from "@/features/recipes/components/SelectGlassware";
import { SelectPreparationMethod } from "@/features/recipes/components/SelectPreparationMethod";
import { METHOD_TO_DEFAULT_DILUTION } from "@/features/recipes/constants";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { TextField } from "@/ui/TextField";

type Props = {
	recipe: RecipeWithSpecs;
};

export function RecipeForm({ recipe }: Props) {
	const [state, formAction] = useActionState(
		updateRecipeAction.bind(null, recipe.id),
		null,
	);

	const [form, fields] = useForm({
		id: recipe?.id ? `recipe-form-${recipe.id}` : "new-recipe-form",
		lastResult: state,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: updateRecipeSchema });
		},
		defaultValue: {
			name: recipe.name,
			description: recipe.description,
			preparationMethod: recipe.preparationMethod,
			dilutionTarget: recipe.dilutionTarget,
			glassware: recipe.glassware,
			garnish: recipe.garnish,
			style: recipe.style,
		},
	});

	return (
		<FormProvider context={form.context}>
			<form
				action={formAction}
				id={form.id}
				onSubmit={form.onSubmit}
				noValidate
			>
				<Grid gap={4}>
					<TextField
						label="Name"
						name="name"
						required
						defaultValue={fields.name.initialValue}
					/>

					<SelectCocktailStyle
						label="Style"
						name="style"
						defaultValue={fields.style.initialValue}
					/>

					<TextField
						as="textarea"
						label="Description"
						name="description"
						defaultValue={fields.description.initialValue}
					/>

					<SelectPreparationMethod
						label="Preparation method"
						name="preparationMethod"
						defaultValue={fields.preparationMethod.initialValue}
						selectProps={{
							onSelectedItemChange: ({ selectedItem }) => {
								if (!selectedItem) {
									return;
								}

								form.update({
									name: "dilutionTarget",
									value: METHOD_TO_DEFAULT_DILUTION.get(selectedItem.value),
								});
							},
						}}
					/>

					<SelectDilution name="dilutionTarget" />

					<SelectGlassware
						label="Glassware"
						name="glassware"
						defaultValue={fields.glassware.initialValue}
					/>

					<TextField
						label="Garnish"
						name="garnish"
						defaultValue={fields.garnish.initialValue}
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
