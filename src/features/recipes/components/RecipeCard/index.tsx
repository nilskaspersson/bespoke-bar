import Link from "next/link";
import type { ReactNode } from "react";
import type { BaseRecipe } from "@/db/schema/recipes";
import { Abv } from "@/features/ingredients/components/Abv";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import {
	COCKTAIL_STYLE_TO_LABEL,
	GLASSWARE_TO_LABEL,
	METHOD_TO_LABEL,
} from "@/features/recipes/constants";
import { calculateRecipeMetrics } from "@/features/recipes/metrics/utils/calculateRecipeMetrics";
import { getRecipeUrl, isRecipe } from "@/features/recipes/utils";
import { SpecsList } from "@/features/specs/components/SpecsList";
import type { UnitSystems } from "@/features/units/utils/convert";
import { useFormatter } from "@/hooks/useFormatter";
import { Chip } from "@/ui/Chip";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

type Props<T> = {
	recipe: T;
	className?: string;
	nameAdornment?: ReactNode;
	children?: ReactNode;
	servings?: number;
	convertUnits?: UnitSystems | null;
	withLink?: boolean;
};

export function RecipeCard<T extends BaseRecipe>({
	recipe,
	className,
	nameAdornment,
	children,
	servings,
	convertUnits,
	withLink = true,
}: Props<T>) {
	const metrics = calculateRecipeMetrics(recipe);
	const { percentageFormatter } = useFormatter();

	return (
		<Grid gap={4} className={className}>
			<Grid as="header" gap={1}>
				<div className={styles.line}>
					<Heading level="h3" serif size={5} className={styles.recipeName}>
						{withLink && isRecipe(recipe) ? (
							<Link href={getRecipeUrl(recipe)}>
								<RecipeName recipe={recipe} />
							</Link>
						) : (
							<RecipeName recipe={recipe} />
						)}
					</Heading>

					{nameAdornment ? (
						<>
							<span className={styles.dots} />
							{nameAdornment}
						</>
					) : null}
				</div>

				<Flex as="div" wrap gap={1}>
					{recipe.style ? (
						<Chip color="light" size={1}>
							{COCKTAIL_STYLE_TO_LABEL.get(recipe.style)}
						</Chip>
					) : null}

					{recipe.preparationMethod ? (
						<Chip color="light" size={1}>
							{METHOD_TO_LABEL.get(recipe.preparationMethod)}
						</Chip>
					) : null}

					<Chip color="light" size={1}>
						{percentageFormatter.format(metrics.abv)} <Abv />
					</Chip>

					{recipe.glassware ? (
						<Chip color="light" size={1}>
							{GLASSWARE_TO_LABEL.get(recipe.glassware)}
						</Chip>
					) : null}
				</Flex>
			</Grid>

			{recipe.specs && recipe.specs.length > 0 ? (
				<SpecsList
					specs={recipe.specs}
					servings={servings}
					convertUnits={convertUnits}
				/>
			) : (
				<Grid gap={4}>
					<Text as="p" size={2} italic light compact>
						No specs yet
					</Text>
				</Grid>
			)}

			{recipe.instructions || recipe.garnish ? (
				<Grid gap={2}>
					{recipe.instructions ? (
						<Text as="p" size={3} serif>
							{recipe.instructions}
						</Text>
					) : null}

					{recipe.garnish ? (
						<Text as="p" size={3} serif>
							<Text as="span" heavy>
								Garnish:
							</Text>{" "}
							{recipe.garnish}
						</Text>
					) : null}
				</Grid>
			) : null}

			{children}
		</Grid>
	);
}
