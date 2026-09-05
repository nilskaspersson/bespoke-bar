"use client";

import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import type { Keyed } from "@bespoke/schema/types";
import { DraftRecipesPreview } from "@bespoke/ui/DraftRecipesPreview";
import { DraftRecipesStatusBar } from "@bespoke/ui/DraftRecipesStatusBar";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { RecipeEditor } from "@bespoke/ui/RecipeEditor";
import { clsx } from "clsx";
import { Activity, type ComponentProps, useState } from "react";
import {
	type DisplayMode,
	DisplayModeSwitch,
} from "@/features/recipes/photo/components/DisplayModeSwitch";
import styles from "./styles.module.css";

export function OCROutputPreview({
	className,
	disabled,
	draftRecipes,
	ingredients,
	ocrText,
	draftText,
	onChangeDraftRecipesText,
	...props
}: ComponentProps<"section"> & {
	disabled?: boolean;
	draftRecipes: Keyed<BaseRecipe>[];
	ingredients: Ingredient[];
	ocrText: string;
	draftText: string;
	onChangeDraftRecipesText: (text: string) => void;
}) {
	const [displayMode, setDisplayMode] = useState<DisplayMode>("PREVIEW");

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
				<DraftRecipesPreview recipes={draftRecipes} />
			</Activity>

			<Activity mode={displayMode === "EDIT" ? "visible" : "hidden"}>
				{!disabled ? (
					<RecipeEditor
						key={ocrText}
						ingredients={ingredients}
						initialText={draftText}
						onTextChange={onChangeDraftRecipesText}
						statusBar={<DraftRecipesStatusBar recipes={draftRecipes} />}
					/>
				) : null}
			</Activity>
		</section>
	);
}
