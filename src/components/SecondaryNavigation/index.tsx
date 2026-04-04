import { clsx } from "clsx";
import { cacheLife } from "next/cache";
import type { HTMLAttributes } from "react";
import { SearchRecipesButton } from "@/features/recipes/components/SearchRecipesButton";
import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { NavLink } from "@/ui/NavLink";
import styles from "./styles.module.css";

export async function SecondaryNavigation({
	className,
	...props
}: Omit<HTMLAttributes<HTMLDivElement>, "children">) {
	"use cache";
	cacheLife("max");

	return (
		<nav className={clsx(styles.nav, className)} {...props}>
			<ul className={styles.list}>
				<li className={styles.item}>
					<NavLink
						href="/bar"
						exact
						className={styles.link}
						activeClassName={styles.isActive}
					>
						<Icon name="duotone-shop" size={2} />
						Overview
					</NavLink>
				</li>

				<li className={styles.item}>
					<NavLink
						href="/bar/lists"
						className={styles.link}
						activeClassName={styles.isActive}
					>
						<Icon name="duotone-memo-pad" size={2} />
						Lists
					</NavLink>
				</li>

				<li className={styles.item}>
					<NavLink
						href="/bar/recipes"
						className={styles.link}
						activeClassName={styles.isActive}
					>
						<Icon name="duotone-martini-glass" size={2} />
						Recipes
					</NavLink>
				</li>

				<li className={styles.item}>
					<NavLink
						href="/bar/ingredients"
						className={styles.link}
						activeClassName={styles.isActive}
					>
						<Icon name="duotone-wine-bottle" size={2} />
						Ingredients
					</NavLink>
				</li>
			</ul>

			<div className={styles.footer}>
				<SearchRecipesButton
					variant="outline"
					size="small"
					color="light"
					fullWidth
				>
					<Icon name="magnifying-glass" size={1} />
					Quick search
				</SearchRecipesButton>

				<LinkButton
					href="/bar/recipes/create"
					variant="outline"
					size="small"
					color="accent"
					fullWidth
				>
					Create Recipe
				</LinkButton>
			</div>
		</nav>
	);
}
