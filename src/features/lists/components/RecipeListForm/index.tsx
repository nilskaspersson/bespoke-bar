"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useActionState, useRef } from "react";
import { recipeListWithEntriesFormSchema } from "@/db/schema/composite";
import type { RecipeListWithRecipes } from "@/db/schema/recipeLists";
import type { Recipe } from "@/db/schema/recipes";
import { upsertRecipeListWithEntriesAction } from "@/features/lists/actions/upsertRecipeListWithEntries";
import { SelectRecipe } from "@/features/lists/components/SelectRecipe";
import { Button } from "@/ui/Button";
import { CurrencyInput } from "@/ui/CurrencyInput";
import { FormErrors } from "@/ui/FormErrors";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { TextField } from "@/ui/TextField";

type Props = {
	recipeList?: RecipeListWithRecipes;
	recipes?: Recipe[];
};

export function RecipeListForm({ recipes, recipeList }: Props) {
	const [state, formAction] = useActionState(
		upsertRecipeListWithEntriesAction,
		null,
	);

	const [form, fields] = useForm({
		id: "list-form",
		lastResult: state,
		defaultValue: {
			recipeList: {
				id: recipeList?.id ?? "",
				name: recipeList?.name ?? "",
				description: recipeList?.description ?? "",
				isPublic: recipeList?.isPublic ?? false,
			},
			entries: recipeList?.entries.map((entry) => ({
				sortOrder: entry.sortOrder ?? "",
				price: entry.price ?? "",
				recipeId: entry.recipeId,
			})),
		},
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: recipeListWithEntriesFormSchema,
			});
		},
	});

	const formRef = useRef<HTMLFormElement>(null);

	const recipeListFields = fields.recipeList.getFieldset();
	const entries = fields.entries.getFieldList();

	return (
		<FormProvider context={form.context}>
			<form
				action={formAction}
				ref={formRef}
				id={form.id}
				onSubmit={form.onSubmit}
				noValidate
			>
				<input type="submit" hidden form={form.id} />

				<input
					type="hidden"
					name={recipeListFields.id.name}
					value={recipeListFields.id.defaultValue}
				/>

				<Grid gap={4}>
					<TextField
						label="Name"
						name={recipeListFields.name.name}
						defaultValue={recipeListFields.name.defaultValue}
						id={recipeListFields.name.id}
					/>

					<TextField
						as="textarea"
						label="Description"
						name={recipeListFields.description.name}
						id={recipeListFields.description.id}
						defaultValue={recipeListFields.description.defaultValue}
					/>

					<ul>
						{entries?.map((entry) => {
							const entryFields = entry.getFieldset();

							return (
								<li key={entry.key}>
									<Grid as="fieldset" gap={2}>
										<input
											type="hidden"
											name={entryFields.sortOrder.name}
											value={entryFields.sortOrder.defaultValue}
										/>

										<SelectRecipe
											name={entryFields.recipeId.name}
											defaultValue={entryFields.recipeId.defaultValue}
											recipes={recipes}
										/>

										<CurrencyInput
											label="Price"
											name={entryFields.price.name}
											id={entryFields.price.id}
											defaultValue={entryFields.price.defaultValue}
										/>
									</Grid>
								</li>
							);
						})}
					</ul>

					<div>
						<Button
							type="submit"
							variant="solid"
							color="accent"
							rounded
							{...form.insert.getButtonProps({
								name: fields.entries.name,
								defaultValue: {
									price: "",
									recipeId: "",
									sortOrder: entries.length,
								},
							})}
						>
							Add Recipe
						</Button>
					</div>

					<FormErrors formRef={formRef} />

					<div>
						<SubmitButton variant="solid" color="accent" form={form.id}>
							<Icon name="pen" />
							Create list
						</SubmitButton>
					</div>
				</Grid>
			</form>
		</FormProvider>
	);
}
