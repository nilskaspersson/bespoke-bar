import Link from "next/link";
import type { ComponentProps } from "react";
import { getCachedCountBarRecipes } from "@/features/recipes/actions/countBarRecipes";
import { getCachedUserFavoriteRecipeIds } from "@/features/recipes/actions/readUserFavoriteRecipeIds";
import { Flex } from "@/ui/Flex";
import { Text } from "@/ui/Text";
import { authOrForbidden } from "@/utils/auth";
import styles from "./styles.module.css";

export async function StatLinks(props: ComponentProps<"nav">) {
	const { orgId, userId } = await authOrForbidden();

	const [recipesCount, favoriteRecipes] = await Promise.all([
		getCachedCountBarRecipes(orgId),
		getCachedUserFavoriteRecipeIds(orgId, userId),
	]);

	return (
		<Flex as="nav" gap={6} {...props}>
			<Link href="/bar/recipes" prefetch className={styles.link}>
				<Text as="div" size={1} compact>
					{recipesCount === 1 ? "Recipe" : "Recipes"}
				</Text>

				<Text as="div" size={5} weight={600} compact className={styles.count}>
					{recipesCount}
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
