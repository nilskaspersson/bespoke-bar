import { lineIsDraft } from "@bespoke/domain/ingredientLines/predicates";
import { calculateRecipeMetrics } from "@bespoke/domain/recipes/calculateRecipeMetrics";
import { getKey } from "@bespoke/domain/utils/withKey";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { Abv } from "@bespoke/ui/Abv";
import { Callout } from "@bespoke/ui/Callout";
import { Grid } from "@bespoke/ui/Grid";
import { FormatterContext } from "@bespoke/ui/hooks/useFormatter";
import { Text } from "@bespoke/ui/Text";
import Link from "next/link";
import { type ComponentProps, use } from "react";
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
	const { percentageFormatter } = use(FormatterContext);

	const recipeMetrics = calculateRecipeMetrics(recipe);

	/**
	 * While we estimate the abv on some new ingredients, we cannot assume to
	 * know until the ingredient is created and assumed to have been populated.
	 */
	const draftLines = recipe.lines?.filter(lineIsDraft);
	const isInconclusive = draftLines && draftLines.length > 0;

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
						{recipe.lines?.map((line) => (
							<tr key={getKey(line)}>
								<Text as="td">
									<Link
										href={`/ingredients/${line.ingredient.id}`}
										prefetch={false}
									>
										{line.ingredient.name}
									</Link>
								</Text>

								<Text as="td" align="right">
									{percentageFormatter.format(line.ingredient.abv ?? 0)}
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
							{draftLines
								.filter((o) => Boolean(o.ingredient.name))
								.map((line) => (
									<li key={getKey(line)} className={styles.line}>
										{line.ingredient.name} (
										{percentageFormatter.format(line.ingredient.abv ?? 0)})
									</li>
								))}
						</ul>
					</Callout>
				) : null}
			</Grid>
		</details>
	);
}
