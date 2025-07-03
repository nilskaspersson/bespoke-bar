import type { ComponentProps } from "react";
import type { BaseRecipe } from "@/db/schema/recipes";
import { Abv } from "@/features/ingredients/components/Abv";
import { calculateRecipeMetrics } from "@/features/recipes/utils/calculateRecipeMetrics";
import { specIsDraft } from "@/features/specs/utils";
import { Callout } from "@/ui/Callout";
import { Text } from "@/ui/Text";
import { percentageFormatter } from "@/utils/formatting";
import { getKey } from "@/utils/withKey";
import styles from "./styles.module.css";

export function AbvInfo<T extends BaseRecipe>({
	recipe,
	className,
	diluted = true,
	...props
}: { recipe: T; diluted?: boolean } & Omit<
	ComponentProps<"details">,
	"children"
>) {
	const recipeMetrics = calculateRecipeMetrics(recipe);

	/**
	 * While we estimate the abv on some new ingredients, we cannot assume to
	 * know until the ingredient is created and assumed to have been populated.
	 */
	const draftSpecs = recipe.specs?.filter(specIsDraft);
	const isInconclusive = draftSpecs && draftSpecs.length > 0;

	return (
		<details className={className} {...props}>
			<Text as="summary" size={1} compact>
				<Abv />:{" "}
				<Text heavy weight={600}>
					{percentageFormatter.format(
						diluted ? recipeMetrics.abv : recipeMetrics.undilutedAbv,
					)}
				</Text>{" "}
				({diluted ? "diluted" : "undiluted"})
			</Text>

			<Text as="table" size={1}>
				<tbody>
					<tr>
						<th>Diluted abv</th>
						<td>{percentageFormatter.format(recipeMetrics.abv)}</td>
					</tr>

					<tr>
						<th>Undiluted abv</th>
						<td>{percentageFormatter.format(recipeMetrics.undilutedAbv)}</td>
					</tr>
				</tbody>
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
								<li key={getKey(spec)} className={styles.spec}>
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
