import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { getUserById } from "@/features/organisation/actions/getUserById";
import { FALLBACK_USER_NAME } from "@/features/organisation/constants";
import { getFullName } from "@/features/organisation/utils";
import { RecipeInfo } from "@/features/recipes/components/RecipeInfo";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { RecipeTools } from "@/features/recipes/components/RecipeTools";
import { Heading } from "@/ui/Heading";
import { Text } from "@/ui/Text";
import { Time } from "@/ui/Time";
import styles from "./styles.module.css";

export async function RecipeArticle({
	children,
	recipe,
	className,
	...props
}: {
	actions?: ReactNode;
	recipe: RecipeWithSpecs;
} & ComponentProps<"article">) {
	const author = await getUserById(recipe.createdBy);

	return (
		<article className={clsx(styles.article, className)} {...props}>
			<header className={styles.header}>
				<Heading level="h1" className={styles.name} serif>
					<RecipeName recipe={recipe} />
				</Heading>

				<Text size={2} compact italic serif className={styles.author}>
					{getFullName(author) ?? <i>{FALLBACK_USER_NAME}</i>},{" "}
					<Time date={recipe.createdAt} relativeThreshold={0} />
				</Text>

				{recipe.description ? (
					<Text as="p" heavy serif className={styles.description}>
						{recipe.description}
					</Text>
				) : null}
			</header>

			<RecipeInfo recipe={recipe}>
				<RecipeTools recipe={recipe} className={styles.tools} />

				{children}
			</RecipeInfo>
		</article>
	);
}
