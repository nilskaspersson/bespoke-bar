"use client";

import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { LinkButton } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import styles from "./styles.module.css";

const ITEMS = [
	{ href: "/bar/lists", label: "Lists", match: "/bar/lists" },
	{ href: "/bar2", label: "Recipes", match: "/bar2" },
	{
		href: "/bar/ingredients",
		label: "Ingredients",
		match: "/bar/ingredients",
	},
] as const;

export function BarNavigationV2({
	className,
	...props
}: Omit<ComponentProps<"nav">, "children">) {
	const pathname = usePathname();

	return (
		<nav aria-label="Bar" className={clsx(styles.nav, className)} {...props}>
			<ButtonGroup equalWidth>
				{ITEMS.map((item) => {
					const isActive = pathname.startsWith(item.match);
					return (
						<LinkButton
							key={item.href}
							href={item.href}
							size="small"
							variant="clear"
							color={isActive ? "accent" : "light"}
							aria-current={isActive ? "page" : undefined}
							className={styles.button}
						>
							{item.label}
						</LinkButton>
					);
				})}
			</ButtonGroup>
		</nav>
	);
}
