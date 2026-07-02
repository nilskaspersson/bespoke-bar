import { calculateRecipeMetrics } from "@bespoke/domain/recipes/calculateRecipeMetrics";
import type { UnitSystems } from "@bespoke/domain/units/convert";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { Chip } from "@bespoke/ui/Chip";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { Text } from "@bespoke/ui/Text";
import { clsx } from "clsx";
import Link from "next/link";
import { memo, type ReactNode, useMemo } from "react";
import { EnrichmentMark } from "@/components/EnrichmentMark";
import { IngredientLineList } from "@/features/ingredientLines/components/IngredientLineList";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { RecipeNameAdornment } from "@/features/recipes/components/RecipeNameAdornment";
import {
	COCKTAIL_STYLE_TO_LABEL,
	GLASSWARE_TO_LABEL,
	ICE_TO_LABEL,
	METHOD_TO_LABEL,
} from "@/features/recipes/constants";
import { AbvChip } from "@/features/recipes/metrics/components/AbvChip";
import { getRecipeUrl, isRecipe } from "@/features/recipes/utils";
import styles from "./styles.module.css";

type Props<T> = {
	recipe: T;
	className?: string;
	nameAdornment?: ReactNode;
	children?: ReactNode;
	servings?: number;
	convertUnits?: UnitSystems | null;
	withRounding?: boolean;
	withBestUnit?: boolean;
	withLink?: boolean;
	animateNumbers?: boolean;
};

function RecipeCardImpl<T extends BaseRecipe>({
	recipe,
	className,
	nameAdornment,
	children,
	servings,
	convertUnits,
	withRounding,
	withBestUnit,
	withLink = true,
	animateNumbers = true,
}: Props<T>) {
	const metrics = useMemo(() => calculateRecipeMetrics(recipe), [recipe]);

	const enrichedFields = new Set(recipe.aiEnrichedFields ?? []);

	const adornment =
		nameAdornment ??
		(servings !== undefined ? (
			<RecipeNameAdornment servings={servings} />
		) : null);

	return (
		<Grid
			gap={4}
			className={clsx(styles.card, className)}
			alignContent="space-between"
		>
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

					{adornment ? (
						<>
							<span className={styles.dots} />
							{adornment}
						</>
					) : null}
				</div>

				<Flex as="div" wrap gap={1}>
					{recipe.style ? (
						<Chip
							color="light"
							size={1}
							icon={
								enrichedFields.has("style") ? <EnrichmentMark /> : undefined
							}
						>
							{COCKTAIL_STYLE_TO_LABEL.get(recipe.style)}
						</Chip>
					) : null}

					{recipe.preparationMethod ? (
						<Chip
							color="light"
							size={1}
							icon={
								enrichedFields.has("preparationMethod") ? (
									<EnrichmentMark />
								) : undefined
							}
						>
							{METHOD_TO_LABEL.get(recipe.preparationMethod)}
						</Chip>
					) : null}

					<AbvChip abv={metrics.abv} />

					{recipe.glassware ? (
						<Chip
							color="light"
							size={1}
							icon={
								enrichedFields.has("glassware") ? <EnrichmentMark /> : undefined
							}
						>
							{GLASSWARE_TO_LABEL.get(recipe.glassware)}
						</Chip>
					) : null}

					{recipe.ice && recipe.ice !== "none" ? (
						<Chip
							color="light"
							size={1}
							icon={enrichedFields.has("ice") ? <EnrichmentMark /> : undefined}
						>
							{ICE_TO_LABEL.get(recipe.ice)}
						</Chip>
					) : null}
				</Flex>
			</Grid>

			{recipe.lines && recipe.lines.length > 0 ? (
				<IngredientLineList
					lines={recipe.lines}
					servings={servings}
					convertUnits={convertUnits}
					withRounding={withRounding}
					withBestUnit={withBestUnit}
					animateNumbers={animateNumbers}
				/>
			) : null}

			{recipe.garnish ? (
				<Text as="p" size={3} serif>
					<Text as="span" heavy>
						Garnish:
					</Text>{" "}
					{recipe.garnish}
				</Text>
			) : null}

			{children}
		</Grid>
	);
}

export const RecipeCard = memo(RecipeCardImpl) as typeof RecipeCardImpl;

/**
 * Lightweight stand-in for off-screen cards: the card shell + name only, no
 * lines/chips/metrics. Keeps the name in the DOM so native find-in-page still
 * works, and reserves card-sized space (via `.card`'s min-height) so the swap
 * to the full card stays stable.
 */
export function RecipeCardPlaceholder<T extends BaseRecipe>({
	recipe,
	className,
}: {
	recipe: T;
	className?: string;
}) {
	return (
		<Grid
			gap={4}
			className={clsx(styles.card, className)}
			alignContent="space-between"
		>
			<Grid as="header" gap={1}>
				<div className={styles.line}>
					<Heading level="h3" serif size={5} className={styles.recipeName}>
						<RecipeName recipe={recipe} />
					</Heading>
				</div>
			</Grid>
		</Grid>
	);
}
