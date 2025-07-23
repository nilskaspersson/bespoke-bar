"use client";

import Link from "next/link";
import { useContext } from "react";
import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";
import { Abv } from "@/features/ingredients/components/Abv";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import {
	COCKTAIL_STYLE_TO_LABEL,
	GLASSWARE_TO_LABEL,
	METHOD_TO_LABEL,
} from "@/features/recipes/constants";
import { getRecipeUrl } from "@/features/recipes/utils";
import { calculateRecipeMetrics } from "@/features/recipes/utils/calculateRecipeMetrics";
import { SpecsList } from "@/features/specs/components/SpecsList";
import { FormatterContext } from "@/hooks/useFormatter";
import { LinkButton } from "@/ui/Button";
import { Chip } from "@/ui/Chip";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

type Props = {
	entry: RecipeListEntryWithRecipe;
	className?: string;
};

export function RecipeListEntry({ entry, className }: Props) {
	const metrics = calculateRecipeMetrics(entry.recipe);

	const { currencyFormatter, percentageFormatter } =
		useContext(FormatterContext);

	return (
		<Grid gap={4} className={className}>
			<Grid as="header" gap={1}>
				<div className={styles.line}>
					<Heading level="h3" serif size={5} className={styles.recipeName}>
						<Link href={getRecipeUrl(entry.recipe)}>
							<RecipeName recipe={entry.recipe} />
						</Link>
					</Heading>

					<span className={styles.dots} />

					{entry.price != null ? (
						<Text heavy weight={800} size={2}>
							{currencyFormatter.format(entry.price)}
						</Text>
					) : null}
				</div>

				<Flex as="div" wrap gap={1}>
					{entry.recipe.style ? (
						<Chip color="light" size={1}>
							{COCKTAIL_STYLE_TO_LABEL.get(entry.recipe.style)}
						</Chip>
					) : null}

					{entry.recipe.preparationMethod ? (
						<Chip color="light" size={1}>
							{METHOD_TO_LABEL.get(entry.recipe.preparationMethod)}
						</Chip>
					) : null}

					<Chip color="light" size={1}>
						{percentageFormatter.format(metrics.abv)} <Abv />
					</Chip>

					{entry.recipe.glassware ? (
						<Chip color="light" size={1}>
							{GLASSWARE_TO_LABEL.get(entry.recipe.glassware)}
						</Chip>
					) : null}
				</Flex>
			</Grid>

			{entry.recipe.specs.length > 0 ? (
				<SpecsList specs={entry.recipe.specs} />
			) : (
				<Grid gap={4}>
					<Text as="p" size={2} italic light compact>
						No specs yet
					</Text>

					<div>
						<LinkButton
							href={`/bar/recipes/${entry.recipe.id}/edit`}
							variant="solid"
							size="tiny"
							color="accent"
						>
							Add specs
						</LinkButton>
					</div>
				</Grid>
			)}
		</Grid>
	);
}
