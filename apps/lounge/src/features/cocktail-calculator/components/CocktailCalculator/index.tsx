"use client";

import { userInputToBulkRecipe } from "@bespoke/domain/ingredientLines/userInputToBulkRecipe";
import { isEmptyDraftRecipe } from "@bespoke/domain/recipes/predicates";
import { Abv } from "@bespoke/ui/Abv";
import { BottomRailItems } from "@bespoke/ui/BottomRail";
import { DraftRecipesStatusBar } from "@bespoke/ui/DraftRecipesStatusBar";
import { useHydrateRecipeAdjustments } from "@bespoke/ui/RecipeAdjustments";
import { RecipeAdjustmentsDock } from "@bespoke/ui/RecipeAdjustmentsDock";
import { RecipeEditor } from "@bespoke/ui/RecipeEditor";
import { Text } from "@bespoke/ui/Text";
import { LazyMotion } from "motion/react";
import { useMemo, useState } from "react";
import { IngredientTotals } from "@/features/cocktail-calculator/components/IngredientTotals";
import { RecipesPreview } from "@/features/cocktail-calculator/components/RecipesPreview";
import styles from "./styles.module.css";

const NO_INGREDIENTS: never[] = [];

const BAR_URL = process.env.NEXT_PUBLIC_BAR_URL ?? "";

async function loadMotionFeatures() {
	return import("./motionFeatures").then((m) => m.default);
}

export function CocktailCalculator() {
	const [text, setText] = useState("");

	useHydrateRecipeAdjustments();

	const recipes = useMemo(
		() =>
			userInputToBulkRecipe(text, NO_INGREDIENTS).filter(
				(recipe) => !isEmptyDraftRecipe(recipe),
			),
		[text],
	);

	return (
		<LazyMotion features={loadMotionFeatures}>
			<div className={styles.root}>
				<div className={styles.workspace}>
					<div className={styles.editor}>
						<RecipeEditor
							ingredients={NO_INGREDIENTS}
							onTextChange={setText}
							statusBar={<DraftRecipesStatusBar recipes={recipes} />}
						/>
					</div>

					<RecipesPreview className={styles.preview} recipes={recipes} />
				</div>

				<IngredientTotals recipes={recipes} />

				<Text as="p" size={0} light>
					<Abv /> is estimated from ingredient names.{" "}
					<a href={`${BAR_URL}/ingredients`}>Sign in</a> to manage your own
					ingredients.
				</Text>
			</div>

			<BottomRailItems>
				<RecipeAdjustmentsDock />
			</BottomRailItems>
		</LazyMotion>
	);
}
