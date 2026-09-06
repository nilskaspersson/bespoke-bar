"use client";

import { EMPTY_RECIPE } from "@bespoke/domain/recipes/constants";
import {
	getAssumedPreparationMethod,
	METHOD_TO_DEFAULT_DILUTION,
} from "@bespoke/domain/recipes/dilution";
import type { PreparationMethod } from "@bespoke/schema/schema/preparationMethods";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { GraphPaper, type GraphPaperProps } from "@bespoke/ui/GraphPaper";
import { Panel } from "@bespoke/ui/Panel";
import { useAdjustments } from "@bespoke/ui/RecipeAdjustments";
import { RecipeCard } from "@bespoke/ui/RecipeCard";
import { useState } from "react";
import { RecipeVolumeSummary } from "@/features/cocktail-calculator/components/RecipeVolumeSummary";
import styles from "./styles.module.css";

type Dilution = { method: PreparationMethod; dilutionTarget: number };

function assumedDilution(recipe: BaseRecipe): Dilution {
	const method = getAssumedPreparationMethod(recipe);

	return {
		method,
		dilutionTarget: METHOD_TO_DEFAULT_DILUTION.get(method) ?? 0,
	};
}

export function RecipesPreview({
	recipes,
	...props
}: Omit<GraphPaperProps<"section">, "children"> & {
	recipes: BaseRecipe[];
}) {
	return (
		<GraphPaper as="section" {...props}>
			<ul className={styles.list}>
				{(recipes.length > 0 ? recipes : [EMPTY_RECIPE]).map(
					(recipe, index) => (
						/**
						 * Position is the only identity that survives typing: the parse
						 * mints fresh keys, and name or contents change per keystroke.
						 * Trade-off is a shift when a recipe above is added or removed.
						 */
						// biome-ignore lint/suspicious/noArrayIndexKey: identity explained above
						<li key={index}>
							<RecipePanel recipe={recipe} />
						</li>
					),
				)}
			</ul>
		</GraphPaper>
	);
}

function RecipePanel({ recipe }: { recipe: BaseRecipe }) {
	const { servings, conversionSystem, withRounding, withBestUnit } =
		useAdjustments();
	const [override, setOverride] = useState<Dilution | null>(null);

	const { method, dilutionTarget } = override ?? assumedDilution(recipe);

	return (
		<Panel
			as="article"
			box={
				<RecipeCard
					className={styles.card}
					isPublic
					recipe={recipe}
					servings={servings}
					convertUnits={conversionSystem}
					withRounding={withRounding}
					withBestUnit={withBestUnit}
				/>
			}
			footer={
				<RecipeVolumeSummary
					recipe={recipe}
					method={method}
					dilutionTarget={dilutionTarget}
					onMethodChange={(next) =>
						setOverride({
							method: next,
							dilutionTarget: METHOD_TO_DEFAULT_DILUTION.get(next) ?? 0,
						})
					}
					onDilutionChange={(next) =>
						setOverride({ method, dilutionTarget: next })
					}
				/>
			}
		/>
	);
}
