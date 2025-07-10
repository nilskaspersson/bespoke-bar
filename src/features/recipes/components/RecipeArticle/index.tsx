import { clsx } from "clsx";
import type { ComponentProps } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { getUserById } from "@/features/organisation/actions/getUserById";
import { FALLBACK_USER_NAME } from "@/features/organisation/constants";
import { getFullName } from "@/features/organisation/utils";
import { RecipeInfo } from "@/features/recipes/components/RecipeInfo";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { RecipeTools } from "@/features/recipes/components/RecipeTools";
import { Flex } from "@/ui/Flex";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import { Time } from "@/ui/Time";
import styles from "./styles.module.css";

export async function RecipeArticle({
	recipe,
	className,
	...props
}: { recipe: RecipeWithSpecs } & Omit<ComponentProps<"article">, "children">) {
	const author = await getUserById(recipe.createdBy);

	return (
		<article className={clsx(styles.article, className)} {...props}>
			<header className={styles.header}>
				<Heading level="h1" className={styles.name}>
					<RecipeName recipe={recipe} />
				</Heading>

				<Text size={2} compact italic>
					by {getFullName(author) ?? <i>{FALLBACK_USER_NAME}</i>},{" "}
					<Time date={recipe.createdAt} relativeThreshold={0} />
				</Text>

				{recipe.description ? (
					<Text as="p" className={styles.description}>
						{recipe.description}
					</Text>
				) : null}
			</header>

			<hr className={styles.divider} />

			<RecipeInfo
				recipe={recipe}
				header={
					<Flex gap={4} justifyContent="space-between">
						<Heading level="h3" size={4}>
							<RecipeName recipe={recipe} />
						</Heading>

						<Icon
							name="duotone-martini-glass"
							size={3}
							className={styles.icon}
						/>
					</Flex>
				}
				tools={<RecipeTools recipe={recipe} className={styles.tools} />}
			/>
		</article>
	);
}
