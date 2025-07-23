import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { RecipeListWithRecipeCount } from "@/db/schema/recipeLists";
import { getRecipeListUrl } from "@/features/lists/utils";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import { Time } from "@/ui/Time";
import styles from "./styles.module.css";

export function RecipeListCard({
	list,
	className,
	...props
}: { list: RecipeListWithRecipeCount } & ComponentProps<"section">) {
	return (
		<section {...props} className={clsx(styles.base, className)}>
			<Link
				href={getRecipeListUrl(list)}
				className={styles.card}
				prefetch="auto"
			>
				<div aria-hidden="true" className={styles.badge}>
					<div
						className={clsx(styles.icon, {
							[styles.isFeatured]: list.isFeatured,
						})}
					>
						<Icon name={list.isFeatured ? "star" : "memo-pad"} size={5} />
					</div>
				</div>

				<div className={styles.bevel}>
					<Heading level="h3" serif className={styles.name}>
						{list.name}
					</Heading>

					{list.description ? (
						<Text as="p" size={3} serif balance>
							{list.description}
						</Text>
					) : null}

					<Text as="span" heavy compact size={2} className={styles.count}>
						{list.recipeCount} {list.recipeCount === 1 ? "recipe" : "recipes"}
					</Text>
				</div>

				<Text as="footer" size={1} className={styles.stats} light>
					<span className={styles.stat}>
						Created <Time date={list.createdAt} />
					</span>

					{list.updatedAt ? (
						<span className={styles.stat}>
							{" "}
							Updated <Time date={list.updatedAt} />
						</span>
					) : null}
				</Text>
			</Link>
		</section>
	);
}
