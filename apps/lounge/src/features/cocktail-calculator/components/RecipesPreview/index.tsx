"use client";

import { EMPTY_RECIPE } from "@bespoke/domain/recipes/constants";
import {
	getAssumedPreparationMethod,
	METHOD_TO_DEFAULT_DILUTION,
} from "@bespoke/domain/recipes/dilution";
import { getKey, isKeyed } from "@bespoke/domain/utils/withKey";
import type { PreparationMethod } from "@bespoke/schema/schema/preparationMethods";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import type { Keyed } from "@bespoke/schema/types";
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
	recipes: Keyed<BaseRecipe>[];
}) {
	const { servings, conversionSystem, withRounding, withBestUnit } =
		useAdjustments();
	const [overrides, setOverrides] = useState<Record<number, Dilution>>({});

	function update(index: number, dilution: Partial<Dilution>) {
		setOverrides((current) => ({
			...current,
			[index]: { ...current[index], ...dilution } as Dilution,
		}));
	}

	return (
		<GraphPaper as="section" {...props}>
			<ul className={styles.list}>
				{(recipes.length > 0 ? recipes : [EMPTY_RECIPE]).map(
					(recipe, index) => {
						const { method, dilutionTarget } =
							overrides[index] ?? assumedDilution(recipe);

						return (
							<li key={isKeyed(recipe) ? getKey(recipe) : "placeholder"}>
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
												update(index, {
													method: next,
													dilutionTarget:
														METHOD_TO_DEFAULT_DILUTION.get(next) ?? 0,
												})
											}
											onDilutionChange={(next) =>
												update(index, { method, dilutionTarget: next })
											}
										/>
									}
								/>
							</li>
						);
					},
				)}
			</ul>
		</GraphPaper>
	);
}
