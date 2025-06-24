import Link from "next/link";
import type { ComponentProps } from "react";
import { countArchivedBarRecipes } from "@/features/recipes/actions/countArchivedBarRecipes";
import { countBarRecipes } from "@/features/recipes/actions/countBarRecipes";
import { Flex } from "@/ui/Flex";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export async function StatLinks(props: ComponentProps<"nav">) {
	const [recipesCount, archivedRecipesCount] = await Promise.all([
		countBarRecipes(),
		countArchivedBarRecipes(),
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
				href="/bar/recipes/archive"
				prefetch={false}
				className={styles.link}
			>
				<Text as="div" size={1} compact>
					Archive
				</Text>

				<Text as="div" size={5} weight={600} compact className={styles.count}>
					{archivedRecipesCount}
				</Text>
			</Link>
		</Flex>
	);
}
