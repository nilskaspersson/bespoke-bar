import Link from "next/link";
import type { ComponentProps } from "react";
import type { BaseRecipe } from "@/db/schema/recipes";
import { Abv } from "@/features/ingredients/components/Abv";
import { calculateRecipeMetrics } from "@/features/recipes/utils/calculateRecipeMetrics";
import { specIsDraft } from "@/features/specs/utils";
import { useFormatter } from "@/hooks/useFormatter";
import { Callout } from "@/ui/Callout";
import { Grid } from "@/ui/Grid";
import { Text } from "@/ui/Text";
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
	const { percentageFormatter } = useFormatter();

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
				</Text>
			</Text>

			<Grid gap={2} justifyItems="start">
				<Text as="table" size={1}>
					<tbody>
						<tr>
							<Text as="th" heavy weight={600}>
								Diluted <Abv />
							</Text>
							<Text as="td" align="right">
								{percentageFormatter.format(recipeMetrics.abv)}
							</Text>
						</tr>

						<tr>
							<Text as="th" heavy weight={600}>
								Undiluted <Abv />
							</Text>

							<Text as="td" align="right">
								{percentageFormatter.format(recipeMetrics.undilutedAbv)}
							</Text>
						</tr>
					</tbody>
				</Text>

				<Text as="table" size={1}>
					<thead>
						<Text as="tr" heavy weight={600}>
							<th>Ingredient</th>
							<th>
								<Abv />
							</th>
						</Text>
					</thead>

					<tbody>
						{recipe.specs?.map((spec) => (
							<tr key={getKey(spec)}>
								<Text as="td">
									<Link
										href={`/bar/ingredients/${spec.ingredient.id}`}
										prefetch={false}
									>
										{spec.ingredient.name}
									</Link>
								</Text>

								<Text as="td" align="right">
									{percentageFormatter.format(spec.ingredient.abv ?? 0)}
								</Text>
							</tr>
						))}
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
			</Grid>
		</details>
	);
}
