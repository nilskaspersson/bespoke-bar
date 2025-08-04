import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { RecipeList } from "@/db/schema/recipeLists";
import { RecipesCountBadge } from "@/features/recipes/components/RecipesCountBadge";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import { Time } from "@/ui/Time";
import type { HeadingLevel } from "@/utils/types";
import styles from "./styles.module.css";

function OptionalLink({
	children,
	className,
	href,
	...linkProps
}: Partial<ComponentProps<typeof Link>>) {
	if (href) {
		return (
			<Link
				href={href}
				className={clsx(styles.link, className)}
				prefetch="auto"
				{...linkProps}
			>
				{children}
			</Link>
		);
	}

	return <div className={className}>{children}</div>;
}

export function RecipeListFrame({
	list,
	recipeCount,
	children,
	className,
	href,
	level = "h3",
}: {
	list: RecipeList;
	recipeCount: number;
	href?: string;
	level?: HeadingLevel;
} & ComponentProps<"section">) {
	return (
		<OptionalLink
			href={href}
			className={clsx(styles.card, className, {
				[styles.isFeatured]: list.isFeatured,
			})}
			aria-label={`View list ${list.name}`}
		>
			<div aria-hidden="true" className={styles.badge}>
				<div className={styles.icon}>
					<Icon name={list.isFeatured ? "star" : "memo-pad"} size={5} />
				</div>
			</div>

			<div className={styles.bevel}>
				<div className={styles.inner}>
					<Heading level={level} serif className={styles.name}>
						{list.name}
					</Heading>

					{list.description ? (
						<Text as="p" size={3} serif balance>
							{list.description}
						</Text>
					) : null}

					<RecipesCountBadge count={recipeCount} color="amber" />
				</div>

				{children}
			</div>

			<footer className={styles.stats}>
				<Text size={1} light className={styles.stat}>
					Created: <Time date={list.createdAt} />
				</Text>

				{list.updatedAt ? (
					<Text size={1} light className={styles.stat}>
						{" "}
						Updated: <Time date={list.updatedAt} />
					</Text>
				) : null}
			</footer>
		</OptionalLink>
	);
}
