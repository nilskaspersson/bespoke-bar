"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function BarNavigation({
	className,
	...props
}: Omit<ComponentProps<"nav">, "children">) {
	const pathname = usePathname();

	return (
		<nav className={clsx(styles.nav, className)} {...props}>
			<ul className={styles.list}>
				<li className={styles.item}>
					<Link
						href="/bar"
						inert={pathname === "/bar"}
						className={clsx(styles.link, {
							[styles.isCurrent]: pathname === "/bar",
						})}
					>
						<Icon name="duotone-shop" size={5} className={styles.icon} />

						<Text className={styles.label}>Overview</Text>
					</Link>
				</li>

				<li className={styles.item}>
					<Link
						href="/bar/lists"
						inert={pathname === "/bar/lists"}
						className={clsx(styles.link, {
							[styles.isCurrent]: pathname.startsWith("/bar/lists"),
						})}
					>
						<Icon name="duotone-memo-pad" size={5} className={styles.icon} />

						<Text className={styles.label}>Lists</Text>
					</Link>
				</li>

				<li className={styles.item}>
					<Link
						href="/bar2"
						inert={pathname === "/bar2"}
						className={clsx(styles.link, {
							[styles.isCurrent]: pathname.startsWith("/bar2"),
						})}
					>
						<Icon
							name="duotone-martini-glass"
							size={5}
							className={styles.icon}
						/>

						<Text className={styles.label}>Recipes</Text>
					</Link>
				</li>

				<li className={styles.item}>
					<Link
						href="/bar/ingredients"
						inert={pathname === "/bar/ingredients"}
						className={clsx(styles.link, {
							[styles.isCurrent]: pathname.startsWith("/bar/ingredients"),
						})}
					>
						<Icon name="duotone-wine-bottle" size={5} className={styles.icon} />

						<Text className={styles.label}>Ingredients</Text>
					</Link>
				</li>
			</ul>
		</nav>
	);
}
