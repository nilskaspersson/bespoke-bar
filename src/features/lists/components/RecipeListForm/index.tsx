"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useActionState, useRef } from "react";
import { recipeListFormSchema } from "@/db/schema/recipeLists";
import { createRecipeListAction } from "@/features/lists/actions/createRecipeList";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { TextField } from "@/ui/TextField";

export function RecipeListForm() {
	const [state, formAction] = useActionState(createRecipeListAction, null);

	const [form, fields] = useForm({
		id: "list-form",
		lastResult: state,
		defaultValue: {
			name: "",
			description: "",
			isPublic: false,
		},
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: recipeListFormSchema,
			});
		},
	});

	const formRef = useRef<HTMLFormElement>(null);

	return (
		<FormProvider context={form.context}>
			<form
				action={formAction}
				ref={formRef}
				id={form.id}
				onSubmit={form.onSubmit}
				noValidate
			>
				<Grid gap={4}>
					<TextField
						label="Name"
						name={fields.name.name}
						defaultValue={fields.name.defaultValue}
						id={fields.name.id}
					/>

					<TextField
						as="textarea"
						label="Description"
						name={fields.description.name}
						id={fields.description.id}
						defaultValue={fields.description.defaultValue}
					/>

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
