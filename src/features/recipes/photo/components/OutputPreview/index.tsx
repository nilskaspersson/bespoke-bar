"use client";

import { clsx } from "clsx";
import { Activity, type ComponentProps, useState } from "react";
import { EmptyArea } from "@/components/EmptyArea";
import type { Ingredient } from "@/db/schema/ingredients";
import type { BaseRecipe } from "@/db/schema/recipes";
import { createRecipesWithSpecsFromData } from "@/features/recipes/api/upsertRecipesWithSpecs";
import { DraftRecipeCard } from "@/features/recipes/bulk/components/DraftRecipeCard";
import { RecipeEditor } from "@/features/recipes/bulk/components/RecipeEditor";
import { useCreateBulkDraftRecipes } from "@/features/recipes/bulk/hooks/useCreateBulkDraftRecipes";
import { OverscrollList } from "@/features/recipes/components/OverscrollList";
import {
	type DisplayMode,
	DisplayModeSwitch,
} from "@/features/recipes/photo/components/DisplayModeSwitch";
import { Button } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { getKey, type Keyed } from "@/utils/withKey";
import styles from "./styles.module.css";

export function OutputPreview({
	className,
	disabled,
	draftRecipes,
	ingredients,
	ocrText,
	onChangeDraftRecipesText,
	...props
}: ComponentProps<"section"> & {
	disabled?: boolean;
	draftRecipes: Keyed<BaseRecipe>[];
	ingredients: Ingredient[];
	ocrText: string;
	onChangeDraftRecipesText: (text: string) => void;
}) {
	const [displayMode, setDisplayMode] = useState<DisplayMode>("PREVIEW");

	const submitBulkRecipesAction = useCreateBulkDraftRecipes(
		draftRecipes,
		createRecipesWithSpecsFromData,
	);

	const hasDraftRecipes = draftRecipes.length > 0;

	return (
		<section {...props} className={clsx(className, styles.base)}>
			<Grid gap={4}>
				<Flex gap={4} justifyContent="space-between" alignItems="center" wrap>
					<Heading level="h2" size={4}>
						Extracted {draftRecipes.length > 1 ? "recipes" : "recipe"}
					</Heading>

					<DisplayModeSwitch
						name="displayMode"
						value={displayMode}
						onChange={setDisplayMode}
					/>
				</Flex>
			</Grid>

			<Activity mode={displayMode === "PREVIEW" ? "visible" : "hidden"}>
				{!hasDraftRecipes ? (
					<EmptyArea color="light">
						<Heading level="h3" size={3}>
							No recipes
						</Heading>
					</EmptyArea>
				) : (
					<OverscrollList padding={4}>
						{draftRecipes.map((recipe) => (
							<OverscrollList.Item key={getKey(recipe)}>
								<DraftRecipeCard recipe={recipe} convertUnits={null} />
							</OverscrollList.Item>
						))}
					</OverscrollList>
				)}
			</Activity>

			<Activity mode={displayMode === "EDIT" ? "visible" : "hidden"}>
				{!disabled && (
					<RecipeEditor
						key={ocrText}
						ingredients={ingredients}
						initialText={ocrText}
						onTextChange={onChangeDraftRecipesText}
					/>
				)}
			</Activity>

			<Flex justifyContent="space-between" alignItems="center" gap={4} wrap>
				<Callout
					size={1}
					icon="circle-exclamation"
					variant="inset"
					className={styles.headsup}
				>
					Text extraction can be inaccurate. Double-check extracted recipes.
				</Callout>

				<div className={styles.create}>
					<Button
						variant="solid"
						color={hasDraftRecipes ? "accent" : "light"}
						size="small"
						aria-disabled={!hasDraftRecipes}
						onClick={hasDraftRecipes ? submitBulkRecipesAction : undefined}
					>
						{hasDraftRecipes ? (
							<>
								Create {draftRecipes.length}{" "}
								{draftRecipes.length > 1 ? "recipes" : "recipe"}
							</>
						) : (
							"Create"
						)}
					</Button>
				</div>
			</Flex>
		</section>
	);
}
