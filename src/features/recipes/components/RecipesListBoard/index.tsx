"use client";

import { AnimatePresence, m } from "motion/react";
import { useDeferredValue, useMemo, useState } from "react";

import type { RecipeWithRelations } from "@/db/schema/recipes";
import type { Tag } from "@/db/schema/tags";
import { ClearFiltersPill } from "@/features/recipes/components/ClearFiltersPill";
import { RecipeAdjustmentsProvider } from "@/features/recipes/components/RecipeAdjustments";
import { RecipeAdjustmentsDock } from "@/features/recipes/components/RecipeAdjustmentsDock";
import { RecipeList } from "@/features/recipes/components/RecipeList";
import { RecipeListActions } from "@/features/recipes/components/RecipeListActions";
import { RecipeListFilters } from "@/features/recipes/components/RecipeListFilters";
import type { StyleFilter } from "@/features/recipes/components/RecipeStyleDistribution";
import { RecipesOverviewStats } from "@/features/recipes/components/RecipesOverviewStats";
import { RecipesSearchInput } from "@/features/recipes/components/RecipesSearchInput";
import { RecipesStatsBar } from "@/features/recipes/components/RecipesStatsBar";
import { RecipesTagFilters } from "@/features/recipes/components/RecipesTagFilters";
import {
	createRecipeSearchIndex,
	filterRecipes,
} from "@/features/recipes/utils/filterRecipes";
import { Button, LinkButton } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
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
	const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
	const [selectedStyles, setSelectedStyles] = useState<StyleFilter[]>([]);
	const [favoritesOnly, setFavoritesOnly] = useState(false);
	const [adjustmentsOpen, setAdjustmentsOpen] = useState(false);

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

		if (selectedStyles.length > 0) {
			const styleSet = new Set(selectedStyles);
			result = result.filter((recipe) => styleSet.has(recipe.style ?? null));
		}

		return result;
	}, [
		recipes,
		searchIndex,
		deferredSearch,
		selectedTagIds,
		selectedStyles,
		favoritesOnly,
		favoriteIdSet,
	]);

	function handleResetFilters() {
		setSearch("");
		setSelectedTagIds([]);
		setSelectedStyles([]);
		setFavoritesOnly(false);
	}

	const hasFilters =
		search.length > 0 ||
		selectedTagIds.length > 0 ||
		selectedStyles.length > 0 ||
		favoritesOnly;

	return (
		<RecipeAdjustmentsProvider>
			<div className={styles.board}>
				<RecipeListFilters
					className={styles.filtersSlot}
					hero={
						<Grid gap={3}>
							<Grid gap={2}>
								<Flex gap={4} alignItems="center">
									<Button icon size="large" variant="clear" color="light">
										<Icon size={4} name="filter" />
									</Button>

									<div className={styles.box}>
										<RecipesSearchInput
											value={search}
											onChange={(event) => setSearch(event.target.value)}
										/>
									</div>

									<LinkButton
										icon
										size="large"
										variant="clear"
										color="light"
										href="/bar/recipes/create"
									>
										<Icon size={4} name="plus" />
									</LinkButton>
								</Flex>

								<Text as="div" size={1} compact align="center" fullWidth>
									Filter by Recipe or Ingredient name.
								</Text>
							</Grid>

							{/*<RecipesTagFilters
								recipes={recipes}
								tagOptions={tagOptions}
								selectedTagIds={selectedTagIds}
								onSelectedTagIdsChange={setSelectedTagIds}
							/>*/}
						</Grid>
					}
					statsBar={
						<RecipesStatsBar
							recipes={recipes}
							selectedStyles={selectedStyles}
							onSelectedStylesChange={setSelectedStyles}
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
					}
				/>

				<RecipeList
					className={styles.listSlot}
					recipes={filteredRecipes}
					favoriteRecipeIds={favoriteRecipeIds}
					tagOptions={tagOptions}
					hasFilters={hasFilters}
					onResetFilters={handleResetFilters}
				/>

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
		</RecipeAdjustmentsProvider>
	);
}
