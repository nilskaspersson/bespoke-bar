"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { HTMLAttributes } from "react";
import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

export function SecondaryNavigation({
	className,
	...props
}: Omit<HTMLAttributes<HTMLDivElement>, "children">) {
	const pathname = usePathname();

	return (
		<nav className={clsx(styles.nav, className)} {...props}>
			<ul className={styles.list}>
				<li className={styles.item}>
					<Link
						href="/bar"
						className={clsx(styles.link, {
							[styles.isActive]: pathname === "/bar",
						})}
					>
						<Icon name="duotone-shop" size={2} />
						Overview
					</Link>
				</li>

				<li className={styles.item}>
					<Link
						href="/bar/lists"
						className={clsx(styles.link, {
							[styles.isActive]: pathname.startsWith("/bar/lists"),
						})}
					>
						<Icon name="duotone-memo-pad" size={2} />
						Lists
					</Link>
				</li>

				<li className={styles.item}>
					<Link
						href="/bar/recipes"
						className={clsx(styles.link, {
							[styles.isActive]: pathname.startsWith("/bar/recipes"),
						})}
					>
						<Icon name="duotone-martini-glass" size={2} />
						Recipes
					</Link>
				</li>

				<li className={styles.item}>
					<Link
						href="/bar/ingredients"
						className={clsx(styles.link, {
							[styles.isActive]: pathname.startsWith("/bar/ingredients"),
						})}
					>
						<Icon name="duotone-wine-bottle" size={2} />
						Ingredients
					</Link>
				</li>
			</ul>

			<div className={styles.footer}>
				<LinkButton
					href="/bar/recipes/create"
					variant="outline"
					size="small"
					color="light"
					fullWidth
				>
					Create new Recipe
				</LinkButton>
			</div>
		</nav>
	);
}
