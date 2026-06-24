"use client";

import type { Tag } from "@bespoke/schema/schema/tags";
import { Button } from "@bespoke/ui/Button";
import { Drawer } from "@bespoke/ui/Drawer";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import type { useDialog } from "@bespoke/ui/hooks/useDialog";
import { Text } from "@bespoke/ui/Text";
import { useMemo } from "react";
import { CocktailStyleCloud } from "@/features/recipes/components/CocktailStyleCloud";
import {
	COCKTAIL_STYLE_TO_LABEL,
	type CocktailStyleFilter,
} from "@/features/recipes/constants";
import type { useCocktailStyleSelection } from "@/features/recipes/hooks/useCocktailStyleSelection";
import { RecipeTagCloud } from "@/features/tags/components/RecipeTagCloud";
import type { useTagSelection } from "@/features/tags/hooks/useTagSelection";
import { useTagsById } from "@/features/tags/hooks/useTagsById";

const ALL_COCKTAIL_STYLES: CocktailStyleFilter[] = [
	...COCKTAIL_STYLE_TO_LABEL.keys(),
	null,
];

type Props = ReturnType<typeof useDialog> &
	ReturnType<typeof useTagSelection> &
	ReturnType<typeof useCocktailStyleSelection> & {
		recipeCount: number;
		matchingCount: number;
		tagOptions: Tag[];
		hasFilters: boolean;
		onResetFilters: () => void;
	};

export function RecipesFilterDrawer({
	dialogRef,
	isOpen,
	mounted,
	unmount,
	closeModal,
	selectedTagIds,
	toggleTagId,
	selectedCocktailStyles,
	toggleCocktailStyle,
	recipeCount,
	matchingCount,
	tagOptions,
	hasFilters,
	onResetFilters,
}: Props) {
	const tagsById = useTagsById(tagOptions);

	const allTagIds = useMemo(
		() => tagOptions.map((tag) => tag.id),
		[tagOptions],
	);

	return (
		<Drawer
			ref={dialogRef}
			isOpen={isOpen}
			mounted={mounted}
			onExitComplete={unmount}
			withCancel={false}
			header={
				<Heading level="h3" size={6}>
					Filter Recipes
				</Heading>
			}
			actions={
				<>
					<li>
						<Flex gap={2} alignItems="center">
							<Text as="div" size={1}>
								<Text>Matching Recipes:</Text>{" "}
								{matchingCount === recipeCount ? (
									<Text weight={600} heavy>
										All ({recipeCount})
									</Text>
								) : (
									<>
										<Text weight={600} heavy>
											{matchingCount}
										</Text>
										/{recipeCount}
									</>
								)}
								{hasFilters ? (
									<>
										{" "}
										<Button
											variant="text"
											color="heavy"
											size="tiny"
											onClick={onResetFilters}
										>
											(Clear)
										</Button>
									</>
								) : null}
							</Text>
						</Flex>
					</li>

					<li>
						<Button
							type="button"
							variant="ghost"
							size="tiny"
							onClick={closeModal}
						>
							Close
						</Button>
					</li>
				</>
			}
		>
			{mounted ? (
				<Grid gap={5}>
					<Grid gap={3}>
						<Heading level="h4" size={3}>
							Tags
						</Heading>

						<RecipeTagCloud
							assignedTagIds={allTagIds}
							tagsById={tagsById}
							selectedTagIds={selectedTagIds}
							onToggleTag={toggleTagId}
							label="Available tags"
							emptyLabel="No tags available"
						/>
					</Grid>

					<Grid gap={3}>
						<Heading level="h4" size={3}>
							Cocktail Styles
						</Heading>

						<CocktailStyleCloud
							styles={ALL_COCKTAIL_STYLES}
							selectedStyles={selectedCocktailStyles}
							onToggleStyle={toggleCocktailStyle}
						/>
					</Grid>
				</Grid>
			) : null}
		</Drawer>
	);
}
