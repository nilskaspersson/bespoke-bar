"use client";

import { clsx } from "clsx";
import {
	Activity,
	type ChangeEventHandler,
	type ComponentProps,
	useState,
} from "react";
import { EmptyArea } from "@/components/EmptyArea";
import type { BaseRecipe } from "@/db/schema/recipes";
import { createRecipesWithSpecsFromData } from "@/features/recipes/api/upsertRecipesWithSpecs";
import { DraftRecipeCard } from "@/features/recipes/bulk/components/DraftRecipeCard";
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
import { TextArea } from "@/ui/Input";
import { getKey, type Keyed } from "@/utils/withKey";
import styles from "./styles.module.css";

export function OutputPreview({
	className,
	disabled,
	draftRecipes,
	draftRecipesText,
	onChangeDraftRecipesText,
	...props
}: ComponentProps<"section"> & {
	disabled?: boolean;
	draftRecipes: Keyed<BaseRecipe>[];
	draftRecipesText: string;
	onChangeDraftRecipesText: ChangeEventHandler<HTMLTextAreaElement>;
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
				<TextArea
					name="draftRecipeText"
					value={draftRecipesText}
					onChange={onChangeDraftRecipesText}
					rows={5}
					fullWidth
					readOnly={disabled}
				/>
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

				<form action={submitBulkRecipesAction} className={styles.create}>
					<Button
						type="submit"
						variant="solid"
						color={hasDraftRecipes ? "accent" : "light"}
						size="small"
						disabled={!hasDraftRecipes}
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
				</form>
			</Flex>
		</section>
	);
}
