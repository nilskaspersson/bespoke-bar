"use client";

import { clsx } from "clsx";
import {
	type HTMLAttributes,
	type ReactNode,
	useDeferredValue,
	useMemo,
	useState,
} from "react";
import type { RecipeFormData } from "@/db/schema/composite";
import type { Ingredient } from "@/db/schema/ingredients";
import type { Recipe } from "@/db/schema/recipes";
import { DraftRecipeCard } from "@/features/recipes/bulk/components/DraftRecipeCard";
import { RecipeEditor } from "@/features/recipes/bulk/components/RecipeEditor";
import { useCreateBulkDraftRecipes } from "@/features/recipes/bulk/hooks/useCreateBulkDraftRecipes";
import { useBulkDraftTextToBaseRecipes } from "@/features/recipes/bulk/hooks/useFormatBulkDraftRecipes";
import { SelectUnitConversion } from "@/features/recipes/components/SelectUnitConversion";
import type { UnitSystems } from "@/features/units/utils/convert";
import { useDialog } from "@/hooks/useDialog";
import { Button } from "@/ui/Button";
import { Checkbox } from "@/ui/Checkbox";
import { Container } from "@/ui/Container";
import { Dialog } from "@/ui/Dialog";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Kbd } from "@/ui/Kbd";
import { SubmitButton } from "@/ui/SubmitButton";
import { Text } from "@/ui/Text";
import { getKey } from "@/utils/withKey";
import styles from "./styles.module.css";

export function BulkDraftRecipesForm({
	className,
	info,
	ingredients,
	createRecipes,
	...props
}: {
	ingredients: Ingredient[];
	info?: ReactNode;
	createRecipes: (recipes: RecipeFormData[]) => Promise<Recipe[]>;
} & Omit<HTMLAttributes<HTMLFormElement>, "action" | "children">) {
	const [withConversionSystem, setWithConversionSystem] =
		useState<UnitSystems | null>(null);
	const [withSnap, setWithSnap] = useState(false);

	const [draftValue, setDraftValue] = useState("");
	const deferredDraftValue = useDeferredValue(draftValue);

	const draftRecipes = useBulkDraftTextToBaseRecipes(
		deferredDraftValue,
		ingredients,
	);

	const newIngredientCount = useMemo(() => {
		const names = new Set<string>();
		for (const recipe of draftRecipes) {
			for (const spec of recipe.specs ?? []) {
				if (!spec.ingredientId && spec.ingredient?.name) {
					names.add(spec.ingredient.name.toLowerCase());
				}
			}
		}
		return names.size;
	}, [draftRecipes]);

	const formAction = useCreateBulkDraftRecipes(draftRecipes, createRecipes);

	const { dialogRef, isOpen, mounted } = useDialog();
	const recipeCount = draftRecipes.length;

	return (
		<form
			{...props}
			className={clsx(className, styles.form)}
			action={formAction}
		>
			<div className={styles.editor}>
				<RecipeEditor
					ingredients={ingredients}
					onTextChange={setDraftValue}
					statusBar={
						<>
							{recipeCount > 0 ? (
								<Text size={1} light compact>
									{recipeCount} {recipeCount === 1 ? "recipe" : "recipes"}
								</Text>
							) : null}

							{newIngredientCount > 0 ? (
								<Text size={1} light compact>
									{newIngredientCount} new{" "}
									{newIngredientCount === 1 ? "ingredient" : "ingredients"}
								</Text>
							) : null}

							<Button
								variant="ghost"
								size="small"
								onClick={() => dialogRef.current?.showModal()}
								aria-disabled={recipeCount === 0}
								className={styles.submitButton}
							>
								<Icon name="expand" size={2} />
								Preview
							</Button>

							<SubmitButton
								size="small"
								variant="solid"
								color={recipeCount > 0 ? "accent" : "light"}
								disabled={recipeCount === 0}
								endAdornment={
									<Kbd
										shortcut="mod+enter"
										variant="ghost"
										ignoreInputEvents={false}
									/>
								}
							>
								Create
							</SubmitButton>
						</>
					}
				/>
			</div>

			{info}

			<Dialog ref={dialogRef} isOpen={isOpen}>
				{mounted ? (
					<Container className={styles.dialog}>
						<Grid gap={4}>
							<div className={styles.dialogHeader}>
								<Heading level="h2" size={5}>
									Preview
								</Heading>

								<Text size={1} light compact>
									{recipeCount} {recipeCount === 1 ? "recipe" : "recipes"}
								</Text>
							</div>

							<div className={styles.dialogToolbar}>
								<SelectUnitConversion
									name="unitConversionSystem"
									onChange={setWithConversionSystem}
									defaultValue={withConversionSystem}
								/>

								{withConversionSystem ? (
									<Checkbox
										label="Round"
										size="small"
										checked={withSnap}
										onChange={(e) => setWithSnap(e.target.checked)}
									/>
								) : null}
							</div>

							<ul className={styles.recipes}>
								{draftRecipes.map((recipe) => (
									<li key={getKey(recipe)} className={styles.recipe}>
										<DraftRecipeCard
											recipe={recipe}
											convertUnits={withConversionSystem}
											snap={withSnap}
										/>
									</li>
								))}
							</ul>

							<div className={styles.dialogFooter}>
								<Button
									variant="ghost"
									size="small"
									onClick={() => dialogRef.current?.close()}
								>
									Close
								</Button>
							</div>
						</Grid>
					</Container>
				) : null}
			</Dialog>
		</form>
	);
}
