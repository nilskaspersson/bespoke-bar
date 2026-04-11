"use client";

import { clsx } from "clsx";
import {
	type HTMLAttributes,
	type ReactNode,
	useDeferredValue,
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

	const formAction = useCreateBulkDraftRecipes(draftRecipes, createRecipes);

	const { dialogRef, isOpen } = useDialog();
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
					footerEnd={
						<Button
							variant="ghost"
							size="tiny"
							onClick={() => dialogRef.current?.showModal()}
							aria-disabled={recipeCount === 0}
						>
							<Icon name="expand" size={2} />
							Preview
							{recipeCount > 0 ? (
								<Text as="span" size={0} light>
									{recipeCount}
								</Text>
							) : null}
						</Button>
					}
				/>
			</div>

			{info}

			<Dialog ref={dialogRef} isOpen={isOpen}>
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

							<SubmitButton size="small" disabled={recipeCount === 0}>
								Create
							</SubmitButton>
						</div>
					</Grid>
				</Container>
			</Dialog>
		</form>
	);
}
