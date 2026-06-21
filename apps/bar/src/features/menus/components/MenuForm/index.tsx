"use client";

import {
	type MenuWithRecipes,
	menuWithEntriesFormSchema,
} from "@bespoke/schema/schema/composite";
import type { Recipe } from "@bespoke/schema/schema/recipes";
import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useCallback, useRef } from "react";
import { upsertMenuWithEntriesAction } from "@/features/menus/api/upsertMenuWithEntries";
import { SelectRecipe } from "@/features/menus/components/SelectRecipe";
import { trpc } from "@/trpc/client";
import { Button } from "@/ui/Button";
import { CurrencyInput } from "@/ui/CurrencyInput";
import { FormErrors } from "@/ui/FormErrors";
import { Grid } from "@/ui/Grid";
import { TextField } from "@/ui/TextField";
import { toast } from "@/ui/Toast";

export const MENU_FORM_ID = "menu-form";

type Props = {
	menu?: MenuWithRecipes;
	recipes?: Recipe[];
};

export function MenuForm({ recipes, menu }: Props) {
	const [form, fields] = useForm({
		id: MENU_FORM_ID,
		defaultValue: {
			menu: {
				id: menu?.id ?? "",
				name: menu?.name ?? "",
				description: menu?.description ?? "",
				isPublic: menu?.isPublic ?? false,
			},
			entries: menu?.entries.map((entry) => ({
				sortOrder: entry.sortOrder ?? "",
				price: entry.price ?? "",
				recipeId: entry.recipeId,
			})),
		},
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: menuWithEntriesFormSchema,
			});
		},
	});

	const utils = trpc.useUtils();

	const handleSubmit = useCallback(
		async (formData: FormData) => {
			const promise = upsertMenuWithEntriesAction(formData);

			toast.promise(promise, {
				loading: "Creating menu…",
				success: () => ({
					message: "Menu created",
				}),
				error: () => ({
					message: "Could not create menu",
					description: "Try again later.",
				}),
			});

			await promise;
			utils.menu.list.invalidate();
		},
		[utils],
	);

	const formRef = useRef<HTMLFormElement>(null);

	const menuFields = fields.menu.getFieldset();
	const entries = fields.entries.getFieldList();

	return (
		<FormProvider context={form.context}>
			<form
				action={handleSubmit}
				ref={formRef}
				id={form.id}
				onSubmit={form.onSubmit}
				noValidate
			>
				<input type="submit" hidden form={form.id} />

				<input
					type="hidden"
					name={menuFields.id.name}
					value={menuFields.id.defaultValue}
				/>

				<Grid gap={4}>
					<TextField
						label="Name"
						name={menuFields.name.name}
						defaultValue={menuFields.name.defaultValue}
						id={menuFields.name.id}
					/>

					<TextField
						as="textarea"
						label="Description"
						name={menuFields.description.name}
						id={menuFields.description.id}
						defaultValue={menuFields.description.defaultValue}
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
				</Grid>
			</form>
		</FormProvider>
	);
}
