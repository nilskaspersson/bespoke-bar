import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import type { ComponentProps } from "react";
import { getCachedRecipeSlotLimit } from "@/features/billing/api/getRecipeSlotLimit";
import { getCachedCountBarRecipes } from "@/features/recipes/api/countBarRecipes";
import { getCachedUserFavoriteRecipeIds } from "@/features/recipes/api/readUserFavoriteRecipeIds";
import { Flex } from "@/ui/Flex";
import { Text } from "@/ui/Text";
import { cacheEvents } from "@/utils/cache";
import styles from "./styles.module.css";

type StatLinksProps = ComponentProps<"nav"> & {
	orgId: string;
	userId: string;
};

export async function StatLinks({ orgId, userId, ...props }: StatLinksProps) {
	"use cache";
	cacheLife("max");

	cacheTag(
		cacheEvents.recipe.create.tag(orgId),
		cacheEvents.recipe.delete.tag(orgId),
		cacheEvents.favorite.toggle.tag(orgId, userId),
		cacheEvents.recipeSlotGrant.create.tag(orgId),
	);

	const [recipesCount, favoriteRecipes, recipeSlotLimit] = await Promise.all([
		getCachedCountBarRecipes(orgId),
		getCachedUserFavoriteRecipeIds(orgId, userId),
		getCachedRecipeSlotLimit(orgId),
	]);

	return (
		<Flex as="nav" gap={6} {...props}>
			<Link href="/bar/recipes" prefetch className={styles.link}>
				<Text as="div" size={1} compact>
					{recipesCount === 1 ? "Recipe" : "Recipes"}
				</Text>

				<Text as="div" size={5} weight={600} compact className={styles.count}>
					{recipesCount}
					<Text as="span" size={2} weight={400} className={styles.limit}>
						{" / "}
						{recipeSlotLimit}
					</Text>
				</Text>
			</Link>

			<Link
				href="/bar/recipes/favorites"
				prefetch={false}
				className={styles.link}
			>
				<Text as="div" size={1} compact>
					Favorites
				</Text>

				<Text as="div" size={5} weight={600} compact className={styles.count}>
					{favoriteRecipes.length}
				</Text>
			</Link>
		</Flex>
	);
}
