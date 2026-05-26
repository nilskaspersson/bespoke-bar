"use client";

import { clsx } from "clsx";
import { Activity, type ComponentProps, useState } from "react";
import { BottomRailItems } from "@/components/BottomRail";
import type { Ingredient } from "@/db/schema/ingredients";
import type { BaseRecipe } from "@/db/schema/recipes";
import { createRecipesWithSpecsFromData } from "@/features/recipes/api/upsertRecipesWithSpecs";
import { RecipeEditor } from "@/features/recipes/bulk/components/RecipeEditor";
import { useCreateBulkDraftRecipes } from "@/features/recipes/bulk/hooks/useCreateBulkDraftRecipes";
import { DraftRecipesPreview } from "@/features/recipes/components/DraftRecipesPreview";
import {
	type DisplayMode,
	DisplayModeSwitch,
} from "@/features/recipes/photo/components/DisplayModeSwitch";
import { Button } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Kbd } from "@/ui/Kbd";
import type { Keyed } from "@/utils/withKey";
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
		<>
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
					<DraftRecipesPreview recipes={draftRecipes} />
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
			</section>

			<BottomRailItems>
				<Button
					variant="clear"
					rounded
					color="accent"
					aria-disabled={!hasDraftRecipes}
					onClick={hasDraftRecipes ? submitBulkRecipesAction : undefined}
					endAdornment={
						<Kbd
							shortcut="mod+enter"
							variant="ghost"
							ignoreInputEvents={false}
						/>
					}
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
			</BottomRailItems>
		</>
	);
}
