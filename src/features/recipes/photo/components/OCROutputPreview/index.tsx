"use client";

import { clsx } from "clsx";
import { Activity, type ComponentProps, useState } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import type { BaseRecipe } from "@/db/schema/recipes";
import { RecipeEditor } from "@/features/recipes/bulk/components/RecipeEditor";
import { DraftRecipesPreview } from "@/features/recipes/components/DraftRecipesPreview";
import {
	type DisplayMode,
	DisplayModeSwitch,
} from "@/features/recipes/photo/components/DisplayModeSwitch";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import type { Keyed } from "@/utils/withKey";
import styles from "./styles.module.css";

export function OCROutputPreview({
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
	);
}
