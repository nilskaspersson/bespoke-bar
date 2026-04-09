"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useCallback, useMemo, useRef } from "react";
import z from "zod";
import {
	type RecipeListEntryWithRecipe,
	recipeListEntryFormSchema,
} from "@/db/schema/recipeListEntries";
import type { RecipeList } from "@/db/schema/recipeLists";
import { SelectRecipe } from "@/features/lists/components/SelectRecipe";
import { addRecipeToListAction } from "@/features/lists/entries/api/addRecipeToList";
import { RecipeListEntryCard } from "@/features/lists/entries/components/RecipeListEntryCard";
import { createDraftRecipeListEntry } from "@/features/lists/utils";
import { trpc } from "@/trpc/client";
import { CurrencyInput } from "@/ui/CurrencyInput";
import { FormErrors } from "@/ui/FormErrors";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Skeleton } from "@/ui/Skeleton";
import { toast } from "@/ui/Toast";
import styles from "./styles.module.css";

type Props = {
	formId: string;
	list: RecipeList;
	onSuccess?: () => void;
};

export function AddRecipeForm({ formId, list, onSuccess }: Props) {
	const formRef = useRef<HTMLFormElement>(null);

	const { data: recipes } = trpc.recipe.list.useQuery();

	const [form, fields] = useForm({
		id: formId,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: recipeListEntryFormSchema,
			});
		},
		defaultValue: {
			listId: list.id,
			recipeId: "",
			price: "",
		},
	});

	const handleSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			const formData = new FormData(event.currentTarget);
			const promise = addRecipeToListAction(formData);

			toast.promise(promise, {
				loading: "Adding recipe…",
				success: () => ({
					message: "Recipe added to list",
				}),
				error: (err) => ({
					message: "Could not add recipe to list",
					description: err instanceof Error ? err.message : "Try again later.",
				}),
			});

			try {
				await promise;
				onSuccess?.();
			} catch {
				// Handled by toast.promise
			}
		},
		[onSuccess],
	);

	const selectedRecipe = useMemo(() => {
		return recipes?.find((recipe) => recipe.id === fields.recipeId.value);
	}, [recipes, fields.recipeId.value]);

	const draftEntry: RecipeListEntryWithRecipe | null = useMemo(() => {
		if (!selectedRecipe) {
			return null;
		}

		return createDraftRecipeListEntry({
			recipe: selectedRecipe,
			listId: list.id,
			price: fields.price.value
				? z.coerce.number().safeParse(fields.price.value).data
				: null,
		});
	}, [selectedRecipe, list.id, fields.price.value]);

	return (
		<FormProvider context={form.context}>
			<form
				ref={formRef}
				id={form.id}
				onSubmit={handleSubmit}
				autoComplete="off"
			>
				<input type="submit" hidden />

				<input
					type="hidden"
					name={fields.listId.name}
					value={fields.listId.value}
					id={fields.listId.id}
				/>

				<div className={styles.controls}>
					<Grid gap={4}>
						<Heading level="h5">Options</Heading>

						<Grid gap={6}>
							<SelectRecipe
								label="Recipe"
								name={fields.recipeId.name}
								id={fields.recipeId.id}
								recipes={recipes}
							/>

							<CurrencyInput
								label="Sales price (optional)"
								name={fields.price.name}
								id={fields.price.id}
							/>

							<FormErrors formRef={formRef} />
						</Grid>
					</Grid>

					<Grid gap={4}>
						<Heading level="h5">Preview</Heading>
						{draftEntry ? <RecipeListEntryCard entry={draftEntry} /> : null}
					</Grid>
				</div>
			</form>
		</FormProvider>
	);
}

export function AddRecipeFormSkeleton() {
	return (
		<div className={styles.controls}>
			<Grid gap={4}>
				<Skeleton variant="text" width="60px" height="20px" />
				<Grid gap={6}>
					<Skeleton variant="input" />
					<Skeleton variant="input" />
				</Grid>
			</Grid>

			<Grid gap={4}>
				<Skeleton variant="text" width="60px" height="20px" />
				<Skeleton variant="block" width="100%" height="180px" />
			</Grid>
		</div>
	);
}

AddRecipeForm.Skeleton = AddRecipeFormSkeleton;
