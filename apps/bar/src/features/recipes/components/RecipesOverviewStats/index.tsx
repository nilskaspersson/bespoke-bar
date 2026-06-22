"use client";

import { Button } from "@bespoke/ui/Button";
import { Flex, type FlexProps } from "@bespoke/ui/Flex";
import { StatsLine } from "@bespoke/ui/StatsLine";
import { Text } from "@bespoke/ui/Text";
import clsx from "clsx";
import styles from "./styles.module.css";

type Props = {
	favoriteCount: number;
	recipesCount: number;
	recipeSlotLimit: number;
	favoritesOnly: boolean;
	onFavoritesOnlyChange: (value: boolean) => void;
};

export function RecipesOverviewStats({
	favoriteCount,
	recipesCount,
	recipeSlotLimit,
	favoritesOnly,
	onFavoritesOnlyChange,
	...props
}: Props & FlexProps) {
	return (
		<Flex gap={5} alignItems="flex-end" {...props}>
			<Button
				onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
				aria-pressed={favoritesOnly}
				className={styles.button}
			>
				<StatsLine overline="Favorites">{favoriteCount}</StatsLine>
			</Button>

			<StatsLine overline={recipesCount === 1 ? "Recipe" : "Recipes"}>
				{recipesCount}

				<Text
					size={2}
					weight={500}
					light
					className={clsx({
						[styles.overCap]: recipesCount > recipeSlotLimit,
					})}
				>
					{" / "}
					{recipeSlotLimit}
				</Text>
			</StatsLine>
		</Flex>
	);
}
