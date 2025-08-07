"use client";

import Link from "next/link";
import { EntityActions } from "@/app/components/EntityActions";
import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";
import { Abv } from "@/features/ingredients/components/Abv";
import { addRecipeToList } from "@/features/lists/actions/addRecipeToList";
import { removeRecipeFromList } from "@/features/lists/actions/removeRecipeFromList";
import { RecipeEntryProfitLabel } from "@/features/lists/components/RecipeEntryProfitLabel";
import { RemoveListEntryButton } from "@/features/lists/components/RemoveListEntryButton";
import { UpdateRecipeEntryFormDialog } from "@/features/lists/components/UpdateRecipeEntryFormDialog";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import {
	COCKTAIL_STYLE_TO_LABEL,
	GLASSWARE_TO_LABEL,
	METHOD_TO_LABEL,
} from "@/features/recipes/constants";
import { getRecipeUrl } from "@/features/recipes/utils";
import { calculateRecipeMetrics } from "@/features/recipes/utils/calculateRecipeMetrics";
import { getRecipeCost } from "@/features/recipes/utils/getRecipeCost";
import { SpecsList } from "@/features/specs/components/SpecsList";
import { useFormatter } from "@/hooks/useFormatter";
import { LinkButton } from "@/ui/Button";
import { Chip } from "@/ui/Chip";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import { ToggleModalButton } from "@/ui/ToggleModalButton";
import styles from "./styles.module.css";

type Props = {
	entry: RecipeListEntryWithRecipe;
	className?: string;
	editable?: boolean;
	children?: React.ReactNode;
};

export function RecipeListEntryCard({
	entry,
	className,
	editable,
	children,
}: Props) {
	const metrics = calculateRecipeMetrics(entry.recipe);

	const { currencyFormatter, percentageFormatter } = useFormatter();
	const { cost, isIncomplete } = getRecipeCost(entry.recipe);

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

					<div>
						<Text as="div" heavy weight={800} size={2} align="right" numeric>
							{typeof entry.price === "number"
								? currencyFormatter.format(entry.price)
								: "No price"}
						</Text>

						{editable ? (
							<RecipeEntryProfitLabel
								as="div"
								size={0}
								align="right"
								price={entry.price}
								cost={cost}
								isIncomplete={isIncomplete}
								className={styles.profit}
							/>
						) : null}
					</div>
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
				</Grid>
			)}

			{entry.recipe.instructions || entry.recipe.garnish ? (
				<Grid gap={2}>
					{entry.recipe.instructions ? (
						<Text as="p" size={3} serif>
							{entry.recipe.instructions}
						</Text>
					) : null}

					{entry.recipe.garnish ? (
						<Text as="p" size={3} serif>
							<Text as="span" heavy>
								Garnish:
							</Text>{" "}
							{entry.recipe.garnish}
						</Text>
					) : null}
				</Grid>
			) : null}

			{editable ? (
				<EntityActions
					gap={2}
					actionProps={{ variant: "outline", color: "light" }}
				>
					{(actionProps) => (
						<>
							<li>
								<ToggleModalButton {...actionProps} label="Update price">
									<UpdateRecipeEntryFormDialog entry={entry} />
								</ToggleModalButton>
							</li>

							<li>
								<LinkButton
									{...actionProps}
									href={`/bar/recipes/${entry.recipe.id}/edit`}
								>
									Edit recipe
								</LinkButton>
							</li>

							<li>
								<RemoveListEntryButton
									{...actionProps}
									entry={entry}
									actionRemove={removeRecipeFromList}
									actionAdd={addRecipeToList}
								>
									<Icon name="xmark" />
									Remove from list
								</RemoveListEntryButton>
							</li>
						</>
					)}
				</EntityActions>
			) : null}

			{children}
		</Grid>
	);
}
