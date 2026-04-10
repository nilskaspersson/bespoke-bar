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
import { SubmitButton } from "@/ui/SubmitButton";
import { Text } from "@/ui/Text";

import { getKey } from "@/utils/withKey";
import styles from "./styles.module.css";

export function BulkDraftRecipesForm({
	className,
	empty,
	ingredients,
	createRecipes,
	...props
}: {
	ingredients: Ingredient[];
	empty?: ReactNode;
	createRecipes: (recipes: RecipeFormData[]) => Promise<Recipe[]>;
} & Omit<HTMLAttributes<HTMLFormElement>, "action" | "children">) {
	const [withConversionSystem, setWithConversionSystem] =
		useState<UnitSystems | null>(null);

	const [draftValue, setDraftValue] = useState("");
	const deferredDraftValue = useDeferredValue(draftValue);

	const draftRecipes = useBulkDraftTextToBaseRecipes(
		deferredDraftValue,
		ingredients,
	);

	const formAction = useCreateBulkDraftRecipes(draftRecipes, createRecipes);

	return (
		<form
			{...props}
			className={clsx(className, styles.form)}
			action={formAction}
		>
			<div className={styles.editor}>
				<RecipeEditor ingredients={ingredients} onTextChange={setDraftValue} />
			</div>

			<div className={styles.toolbar}>
				<SelectUnitConversion
					name="unitConversionSystem"
					onChange={setWithConversionSystem}
					defaultValue={withConversionSystem}
				/>

				<div className={styles.status}>
					{draftRecipes.length > 0 ? (
						<Text size={1} light compact>
							{draftRecipes.length}{" "}
							{draftRecipes.length > 1 ? "recipes" : "recipe"}
						</Text>
					) : null}

					<SubmitButton
						size="small"
						disabled={draftRecipes.length === 0}
						className={styles.create}
					>
						Create
					</SubmitButton>
				</div>
			</div>

			<div>
				{draftRecipes.length === 0 ? (
					empty
				) : (
					<ul className={styles.recipes}>
						{draftRecipes.map((recipe) => (
							<li key={getKey(recipe)} className={styles.recipe}>
								<DraftRecipeCard
									recipe={recipe}
									convertUnits={withConversionSystem}
								/>
							</li>
						))}
					</ul>
				)}
			</div>
		</form>
	);
}
