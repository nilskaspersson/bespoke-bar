"use client";

import { userInputToBulkRecipe } from "@bespoke/domain/ingredientLines/userInputToBulkRecipe";
import { EMPTY_RECIPE } from "@bespoke/domain/recipes/constants";
import { isEmptyDraftRecipe } from "@bespoke/domain/recipes/predicates";
import { getKey, withKey } from "@bespoke/domain/utils/withKey";
import { DraftRecipesStatusBar } from "@bespoke/ui/DraftRecipesStatusBar";
import { Grid } from "@bespoke/ui/Grid";
import {
	RecipeAdjustmentsControls,
	useAdjustments,
	useHydrateRecipeAdjustments,
} from "@bespoke/ui/RecipeAdjustments";
import { RecipeCard } from "@bespoke/ui/RecipeCard";
import { RecipeEditor } from "@bespoke/ui/RecipeEditor";
import { initializePlatform } from "@bespoke/ui/stores/platform";
import { Text } from "@bespoke/ui/Text";
import { LazyMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import styles from "./styles.module.css";

const NO_INGREDIENTS: never[] = [];

function loadMotionFeatures() {
	return import("./motionFeatures").then((m) => m.default);
}

export function RecipeCalculator() {
	const [text, setText] = useState("");
	const { servings, conversionSystem, withRounding, withBestUnit } =
		useAdjustments();

	useHydrateRecipeAdjustments();

	useEffect(() => {
		initializePlatform();
	}, []);

	const recipes = useMemo(
		() =>
			userInputToBulkRecipe(text, NO_INGREDIENTS)
				.filter((recipe) => !isEmptyDraftRecipe(recipe))
				.map(withKey),
		[text],
	);

	return (
		<LazyMotion features={loadMotionFeatures}>
			<div className={styles.root}>
				<div className={styles.editor}>
					<RecipeEditor
						ingredients={NO_INGREDIENTS}
						onTextChange={setText}
						statusBar={<DraftRecipesStatusBar recipes={recipes} />}
					/>
				</div>

				<Grid as="aside" gap={4} className={styles.sidebar}>
					<RecipeAdjustmentsControls />

					<Text as="p" size={0} light>
						ABV is estimated from ingredient names.
					</Text>
				</Grid>

				<ul className={styles.list}>
					{recipes.length === 0 ? (
						<li>
							<RecipeCard recipe={EMPTY_RECIPE} />
						</li>
					) : (
						recipes.map((recipe) => (
							<li key={getKey(recipe)}>
								<RecipeCard
									recipe={recipe}
									servings={servings}
									convertUnits={conversionSystem}
									withRounding={withRounding}
									withBestUnit={withBestUnit}
								/>
							</li>
						))
					)}
				</ul>
			</div>
		</LazyMotion>
	);
}
