"use client";

import { AnimatePresence, m } from "motion/react";
import { useDeferredValue, useMemo, useState } from "react";

import type { RecipeWithRelations } from "@/db/schema/recipes";
import type { Tag } from "@/db/schema/tags";
import { ClearFiltersPill } from "@/features/recipes/components/ClearFiltersPill";
import { RecipeAdjustmentsProvider } from "@/features/recipes/components/RecipeAdjustments";
import { RecipeAdjustmentsDock } from "@/features/recipes/components/RecipeAdjustmentsDock";
import { RecipeListActions } from "@/features/recipes/components/RecipeListActions";
import { RecipesFilterDrawer } from "@/features/recipes/components/RecipesFilterDrawer";
import { RecipesList } from "@/features/recipes/components/RecipesList";
import { RecipesListHeader } from "@/features/recipes/components/RecipesListHeader";
import { RecipesOverviewStats } from "@/features/recipes/components/RecipesOverviewStats";
import { RecipesStatsBar } from "@/features/recipes/components/RecipesStatsBar";
import { useCocktailStyleSelection } from "@/features/recipes/hooks/useCocktailStyleSelection";
import {
	createRecipeSearchIndex,
	filterRecipes,
} from "@/features/recipes/utils/filterRecipes";
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
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);
	const tagSelection = useTagSelection();
	const { selectedTagIds, clearTagIds } = tagSelection;
	const cocktailStyleSelection = useCocktailStyleSelection();
	const {
		selectedCocktailStyles,
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

	const filteredRecipes = useMemo(() => {
		let result = filterRecipes(recipes, searchIndex, deferredSearch);

		if (favoritesOnly) {
			result = result.filter((recipe) => favoriteIdSet.has(recipe.id));
		}

		if (selectedTagIds.length > 0) {
			result = result.filter((recipe) => {
				const recipeTagIds = new Set(recipe.tags.map((rt) => rt.tag.id));
				return selectedTagIds.some((id) => recipeTagIds.has(id));
			});
		}

		if (selectedCocktailStyles.length > 0) {
			const styleSet = new Set(selectedCocktailStyles);
			result = result.filter((recipe) => styleSet.has(recipe.style ?? null));
		}

		return result;
	}, [
		recipes,
		searchIndex,
		deferredSearch,
		selectedTagIds,
		selectedCocktailStyles,
		favoritesOnly,
		favoriteIdSet,
	]);

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
		<RecipeAdjustmentsProvider>
			<div className={styles.board}>
				<Grid gap={8} className={styles.filtersSection}>
					<RecipesListHeader
						search={search}
						onSearchChange={(event) => setSearch(event.target.value)}
						filtersOpen={tagsDialog.isOpen}
						onOpenFilters={tagsDialog.showModal}
					/>

					<RecipesStatsBar
						recipes={recipes}
						selectedStyles={selectedCocktailStyles}
						onSelectedStylesChange={setSelectedCocktailStyles}
						extras={
							<RecipesOverviewStats
								favoriteCount={favoriteRecipeIds.length}
								recipesCount={recipes.length}
								recipeSlotLimit={recipeSlotLimit}
								favoritesOnly={favoritesOnly}
								onFavoritesOnlyChange={setFavoritesOnly}
							/>
						}
					/>
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

				<RecipeListActions className={styles.actionsSlot}>
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
				</RecipeListActions>
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
		</RecipeAdjustmentsProvider>
	);
}
