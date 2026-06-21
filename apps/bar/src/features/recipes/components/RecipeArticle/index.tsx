import type { RecipeWithRelations } from "@bespoke/schema/schema/recipes";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { Suspense } from "react";
import { RecipeAuthorByline } from "@/features/recipes/components/RecipeAuthorByline";
import { RecipeInfo } from "@/features/recipes/components/RecipeInfo";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { Heading } from "@/ui/Heading";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function RecipeArticle({
	recipe,
	isFavorite,
	className,
	...props
}: {
	recipe: RecipeWithRelations;
	isFavorite?: boolean;
} & Omit<ComponentProps<"article">, "children">) {
	return (
		<article className={clsx(styles.article, className)} {...props}>
			<header className={styles.header}>
				<Heading level="h1" className={styles.name} serif>
					<RecipeName recipe={recipe} />
				</Heading>

				<Suspense fallback={<RecipeAuthorByline.Skeleton />}>
					<RecipeAuthorByline
						createdBy={recipe.createdBy}
						createdAt={recipe.createdAt}
					/>
				</Suspense>

				{recipe.description ? (
					<Text as="p" heavy serif className={styles.description}>
						{recipe.description}
					</Text>
				) : null}
			</header>

			<RecipeInfo recipe={recipe} isFavorite={isFavorite} />
		</article>
	);
}

RecipeArticle.Skeleton = function RecipeArticleSkeleton() {
	return (
		<SkeletonScreen className={styles.article}>
			<div className={styles.header}>
				<Skeleton className={styles.name} width="400px" height="74px" />

				<div>
					<RecipeAuthorByline.Skeleton />
				</div>

				<div>
					<Skeleton
						className={styles.description}
						variant="text"
						width="200px"
						height="24px"
					/>
				</div>
			</div>
		</SkeletonScreen>
	);
};
