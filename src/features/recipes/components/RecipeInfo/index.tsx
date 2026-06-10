"use client";

import type { RecipeWithRelations } from "@/db/schema/recipes";
import { RecipeCardActions } from "@/features/recipes/actions/components/RecipeCardActions";
import {
	RecipeAdjustmentsControls,
	useAdjustments,
	useHydrateRecipeAdjustments,
} from "@/features/recipes/components/RecipeAdjustments";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeMetrics } from "@/features/recipes/metrics/components/RecipeMetrics";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import styles from "./styles.module.css";

export function RecipeInfo<T extends RecipeWithRelations>({
	recipe,
	isFavorite,
}: {
	recipe: T;
	isFavorite?: boolean;
}) {
	if (!recipe.lines || recipe.lines.length === 0) {
		return null;
	}

	return <RecipeInfoContent recipe={recipe} isFavorite={isFavorite} />;
}

function RecipeInfoContent<T extends RecipeWithRelations>({
	recipe,
	isFavorite,
}: {
	recipe: T;
	isFavorite?: boolean;
}) {
	useHydrateRecipeAdjustments();

	const { servings, conversionSystem, withRounding, withBestUnit } =
		useAdjustments();

	return (
		<div className={styles.base}>
			<section className={styles.primary}>
				<RecipeCard
					recipe={recipe}
					servings={servings}
					convertUnits={conversionSystem}
					withRounding={withRounding}
					withBestUnit={withBestUnit}
					withLink={false}
				/>

				<RecipeCardActions recipe={recipe} isFavorite={isFavorite} />
			</section>

			<aside className={styles.card}>
				<Heading level="h2" size={4} className={styles.heading}>
					Stats & Settings
				</Heading>

				<Grid gap={4}>
					<RecipeAdjustmentsControls />

					<RecipeMetrics
						recipe={recipe}
						servings={servings}
						convertUnits={conversionSystem}
					/>
				</Grid>
			</aside>
		</div>
	);
}
