import type { ComponentProps } from "react";
import type { DraftRecipe } from "@/db/schema/recipes";
import { Abv } from "@/features/ingredients/components/Abv";
import { calculateRecipeMetrics } from "@/features/recipes/utils/calculateRecipeMetrics";
import { specIsDraft } from "@/features/specs/utils";
import { Callout } from "@/ui/Callout";
import { Text } from "@/ui/Text";
import { percentageFormatter } from "@/utils/formatting";
import { KEY_NAME } from "@/utils/withKey";
import styles from "./styles.module.css";

export function AbvInfo<T extends DraftRecipe>({
	recipe,
	className,
}: { recipe: T; className?: string } & ComponentProps<"details">) {
	const recipeMetrics = calculateRecipeMetrics(recipe);

	/**
	 * While we estimate the abv on some new ingredients, we cannot assume to
	 * know until the ingredient is created and assumed to have been populated.
	 */
	const draftSpecs = recipe.specs?.filter(specIsDraft);
	const isInconclusive = draftSpecs && draftSpecs.length > 0;

	return (
		<details className={className}>
			<Text as="summary" size={1} compact>
				<Abv />: {percentageFormatter.format(recipeMetrics.abv)}
			</Text>

			<Text size={1}>
				Includes{" "}
				{percentageFormatter.format(recipeMetrics.dilutionOfFinalVolume)}{" "}
				dilution.
			</Text>

			{isInconclusive ? (
				<Callout
					size={1}
					icon="circle-exclamation"
					color="light"
					heading="Estimates:"
					className={styles.callout}
				>
					<ul>
						{draftSpecs
							.filter((o) => Boolean(o.ingredient.name))
							.map((spec) => (
								<li key={spec[KEY_NAME]} className={styles.spec}>
									{spec.ingredient.name} (
									{percentageFormatter.format(spec.ingredient.abv ?? 0)})
								</li>
							))}
					</ul>
				</Callout>
			) : null}
		</details>
	);
}
