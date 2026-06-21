"use client";

import { pluralize } from "@bespoke/domain/utils/formatting";
import type { RecipeWithRelations } from "@bespoke/schema/schema/recipes";
import type { Tag } from "@bespoke/schema/schema/tags";
import { AnimatePresence, m } from "motion/react";
import { useDeferredValue, useMemo, useState } from "react";
import { BottomRailItems } from "@/components/BottomRail";
import { ClearFiltersPill } from "@/features/recipes/components/ClearFiltersPill";
import { useHydrateRecipeAdjustments } from "@/features/recipes/components/RecipeAdjustments";
import { RecipeAdjustmentsDock } from "@/features/recipes/components/RecipeAdjustmentsDock";
import { RecipesFilterDrawer } from "@/features/recipes/components/RecipesFilterDrawer";
import { RecipesList } from "@/features/recipes/components/RecipesList";
import { RecipesListHeader } from "@/features/recipes/components/RecipesListHeader";
import { RecipesOverviewStats } from "@/features/recipes/components/RecipesOverviewStats";
import { RecipesStatsBar } from "@/features/recipes/components/RecipesStatsBar";
import { useCocktailStyleSelection } from "@/features/recipes/hooks/useCocktailStyleSelection";
import {
	applyRecipeFilters,
	createRecipeSearchIndex,
} from "@/features/recipes/utils/applyRecipeFilters";
import { useTagSelection } from "@/features/tags/hooks/useTagSelection";
import { useDialog } from "@/hooks/useDialog";
import { Button } from "@/ui/Button";
import { Grid } from "@/ui/Grid";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export { RecipesListBoardSkeleton } from "./Skeleton";

type Props = {
	recipes: RecipeWithRelations[];
	favoriteRecipeIds: string[];
	tagOptions: Tag[];
	recipeSlotLimit: number;
};

export function RecipesListBoard({
	recipes,
	favoriteRecipeIds,
	tagOptions,
	recipeSlotLimit,
}: Props) {
	useHydrateRecipeAdjustments();

	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);
	const tagSelection = useTagSelection();
	const { selectedTagIds, clearTagIds } = tagSelection;
	const cocktailStyleSelection = useCocktailStyleSelection();
	const {
		selectedCocktailStyles,
		deferredSelectedCocktailStyles,
		setSelectedCocktailStyles,
		clearCocktailStyles,
	} = cocktailStyleSelection;
	const [favoritesOnly, setFavoritesOnly] = useState(false);
	const [adjustmentsOpen, setAdjustmentsOpen] = useState(false);
	const tagsDialog = useDialog();

	const favoriteIdSet = useMemo(
		() => new Set(favoriteRecipeIds),
		[favoriteRecipeIds],
	);

	const searchIndex = useMemo(
		() => createRecipeSearchIndex(recipes),
		[recipes],
	);

	const filteredRecipes = useMemo(
		() =>
			applyRecipeFilters(recipes, searchIndex, {
				query: deferredSearch,
				favoriteIdSet: favoritesOnly ? favoriteIdSet : null,
				selectedTagIds,
				selectedStyles: deferredSelectedCocktailStyles,
			}),
		[
			recipes,
			searchIndex,
			deferredSearch,
			selectedTagIds,
			deferredSelectedCocktailStyles,
			favoritesOnly,
			favoriteIdSet,
		],
	);

	function handleResetFilters() {
		setSearch("");
		clearTagIds();
		clearCocktailStyles();
		setFavoritesOnly(false);
	}

	const hasFilters =
		search.length > 0 ||
		selectedTagIds.length > 0 ||
		selectedCocktailStyles.length > 0 ||
		favoritesOnly;

	return (
		<>
			<div className={styles.board}>
				<Grid gap={8} className={styles.filtersSection}>
					<RecipesListHeader
						search={search}
						onSearchChange={(event) => setSearch(event.target.value)}
						filtersOpen={tagsDialog.isOpen}
						onOpenFilters={tagsDialog.showModal}
					>
						<Text as="p" size={1} compact align="center" fullWidth>
							{filteredRecipes.length !== recipes.length ? (
								<>
									<Text as="span" numeric size={1} compact heavy weight={500}>
										{filteredRecipes.length}
									</Text>{" "}
									matching {pluralize(filteredRecipes.length, "Recipe")}.
								</>
							) : (
								"Filter by Recipe name or Ingredient."
							)}
						</Text>
					</RecipesListHeader>

					<RecipesStatsBar
						recipes={recipes}
						selectedStyles={selectedCocktailStyles}
						onSelectedStylesChange={setSelectedCocktailStyles}
					>
						<RecipesOverviewStats
							favoriteCount={favoriteRecipeIds.length}
							recipesCount={recipes.length}
							recipeSlotLimit={recipeSlotLimit}
							favoritesOnly={favoritesOnly}
							onFavoritesOnlyChange={setFavoritesOnly}
						/>
					</RecipesStatsBar>
				</Grid>

				<div className={styles.listSlot}>
					{filteredRecipes.length === 0 ? (
						<div className={styles.empty}>
							<Text as="p" size={3} light>
								No recipes match these filters.
							</Text>

							<Button variant="text" size="small" onClick={handleResetFilters}>
								Reset filters
							</Button>
						</div>
					) : (
						<RecipesList
							recipes={filteredRecipes}
							favoriteRecipeIds={favoriteRecipeIds}
							tagOptions={tagOptions}
							withActions
							withCreate={!hasFilters}
							className={styles.list}
						/>
					)}
				</div>

				<BottomRailItems>
					<div className={styles.dockGroup}>
						<RecipeAdjustmentsDock onOpenChange={setAdjustmentsOpen} />

						<AnimatePresence mode="popLayout">
							{hasFilters && !adjustmentsOpen ? (
								<m.div
									key="clear"
									layout
									initial={{ opacity: 0, scale: 0.4 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.4 }}
									transition={{
										type: "spring",
										visualDuration: 0.3,
										bounce: 0.4,
									}}
								>
									<ClearFiltersPill onClick={handleResetFilters} />
								</m.div>
							) : null}
						</AnimatePresence>
					</div>
				</BottomRailItems>
			</div>

			<RecipesFilterDrawer
				{...tagsDialog}
				{...tagSelection}
				{...cocktailStyleSelection}
				recipeCount={recipes.length}
				matchingCount={filteredRecipes.length}
				tagOptions={tagOptions}
				hasFilters={hasFilters}
				onResetFilters={handleResetFilters}
			/>
		</>
	);
}
