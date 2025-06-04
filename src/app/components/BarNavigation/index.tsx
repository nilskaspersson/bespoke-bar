"use client";

import { OrganizationSwitcher } from "@clerk/nextjs";
import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { HTMLAttributes } from "react";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function BarNavigation({
	className,
	...props
}: Omit<HTMLAttributes<HTMLDivElement>, "children">) {
	const pathname = usePathname();

	return (
		<nav className={clsx(styles.nav, className)} {...props}>
			<div className={styles.container}>
				<div className={styles.bar}>
					<OrganizationSwitcher hidePersonal hideSlug />
				</div>

				<Text as="ul" size={2} compact className={styles.list}>
					<li className={styles.item}>
						<Link
							href="/bar"
							className={clsx(styles.link, {
								[styles.isActive]: pathname === "/bar",
							})}
						>
							Overview
						</Link>
					</li>

					<li className={styles.item}>
						<Link
							href="/bar/recipes"
							className={clsx(styles.link, {
								[styles.isActive]: pathname === "/bar/recipes",
							})}
						>
							Recipes
						</Link>
					</li>

					<li className={styles.item}>
						<Link
							href="/bar/lists"
							className={clsx(styles.link, {
								[styles.isActive]: pathname === "/bar/lists",
							})}
						>
							Lists
						</Link>
					</li>

					<li className={styles.item}>
						<Link
							href="/bar/ingredients"
							className={clsx(styles.link, {
								[styles.isActive]: pathname === "/bar/ingredients",
							})}
						>
							Ingredients
						</Link>
					</li>
				</Text>
			</div>
		</nav>
	);
}
