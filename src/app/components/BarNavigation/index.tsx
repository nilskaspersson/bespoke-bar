"use client";

import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { LinkButton } from "@/ui/Button";
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
				<li>
					<LinkButton
						href="/bar"
						icon
						color="accent"
						variant={pathname === "/bar" ? "solid" : "outline"}
						inert={pathname === "/bar"}
						className={styles.button}
					>
						<Icon name="duotone-shop" size={4} />

						<Text size={1} className={styles.label}>
							Overview
						</Text>
					</LinkButton>
				</li>

				<li>
					<LinkButton
						href="/bar/lists"
						icon
						color="accent"
						variant={pathname === "/bar/lists" ? "solid" : "outline"}
						inert={pathname === "/bar/lists"}
						className={styles.button}
					>
						<Icon name="duotone-memo-pad" size={4} />

						<Text size={1} className={styles.label}>
							Lists
						</Text>
					</LinkButton>
				</li>

				<li>
					<LinkButton
						href="/bar/recipes"
						icon
						color="accent"
						variant={pathname === "/bar/recipes" ? "solid" : "outline"}
						inert={pathname === "/bar/recipes"}
						className={styles.button}
					>
						<Icon name="duotone-martini-glass" size={4} />

						<Text size={1} className={styles.label}>
							Recipes
						</Text>
					</LinkButton>
				</li>

				<li>
					<LinkButton
						href="/bar/ingredients"
						icon
						color="accent"
						variant={pathname === "/bar/ingredients" ? "solid" : "outline"}
						inert={pathname === "/bar/ingredients"}
						className={styles.button}
					>
						<Icon name="duotone-wine-bottle" size={4} />

						<Text size={1} className={styles.label}>
							Ingredients
						</Text>
					</LinkButton>
				</li>
			</ul>
		</nav>
	);
}
