"use client";

import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useCallback, useMemo, useRef } from "react";
import z from "zod";
import {
	type MenuEntryWithRecipe,
	menuEntryFormSchema,
} from "@/db/schema/menuEntries";
import type { Menu } from "@/db/schema/menus";
import { SelectRecipe } from "@/features/menus/components/SelectRecipe";
import { addRecipeToMenuAction } from "@/features/menus/entries/api/addRecipeToMenu";
import { MenuEntryNameAdornment } from "@/features/menus/entries/components/MenuEntryNameAdornment";
import { createDraftMenuEntry } from "@/features/menus/utils";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { useIndexedItems } from "@/hooks/useIndexedItems";
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
	menu: Menu;
	onSuccess?: () => void;
};

const getRecipeId = (recipe: { id: string }) => recipe.id;

export function AddRecipeForm({ formId, menu, onSuccess }: Props) {
	const formRef = useRef<HTMLFormElement>(null);

	const { data: recipes } = trpc.recipe.list.useQuery();

	const [form, fields] = useForm({
		id: formId,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: menuEntryFormSchema,
			});
		},
		defaultValue: {
			menuId: menu.id,
			recipeId: "",
			price: "",
		},
	});

	const handleSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			const formData = new FormData(event.currentTarget);
			const promise = addRecipeToMenuAction(formData);

			toast.promise(promise, {
				loading: "Adding recipe…",
				success: () => ({
					message: "Recipe added to menu",
				}),
				error: (err) => ({
					message: "Could not add recipe to menu",
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

	const recipesById = useIndexedItems(recipes, getRecipeId);

	const selectedRecipe = useMemo(() => {
		return fields.recipeId.value
			? recipesById.get(fields.recipeId.value)
			: undefined;
	}, [recipesById, fields.recipeId.value]);

	const draftEntry: MenuEntryWithRecipe | null = useMemo(() => {
		if (!selectedRecipe) {
			return null;
		}

		return createDraftMenuEntry({
			recipe: selectedRecipe,
			menuId: menu.id,
			price: fields.price.value
				? z.coerce.number().safeParse(fields.price.value).data
				: null,
		});
	}, [selectedRecipe, menu.id, fields.price.value]);

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
					name={fields.menuId.name}
					value={fields.menuId.value}
					id={fields.menuId.id}
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
						{draftEntry ? (
							<RecipeCard
								recipe={draftEntry.recipe}
								nameAdornment={<MenuEntryNameAdornment entry={draftEntry} />}
							/>
						) : null}
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
