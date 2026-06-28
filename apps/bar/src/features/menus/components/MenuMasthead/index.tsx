import type { MenuWithRecipes } from "@bespoke/schema/schema/composite";
import { Flex } from "@bespoke/ui/Flex";
import { Heading } from "@bespoke/ui/Heading";
import { Icon } from "@bespoke/ui/Icon";
import { StatsLine } from "@bespoke/ui/StatsLine";
import { Text } from "@bespoke/ui/Text";
import { Time } from "@bespoke/ui/Time";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { MenuRangeChips } from "@/features/menus/components/MenuRangeChips";
import { getMenuName } from "@/features/menus/utils";
import { getMenuComposition } from "@/features/menus/utils/menuComposition";
import { CocktailStyleBar } from "@/features/recipes/components/CocktailStyleBar";
import { CocktailStyleChip } from "@/features/recipes/components/CocktailStyleChip";
import styles from "./styles.module.css";

export function MenuMasthead({
	menu,
	actions,
	className,
	...props
}: {
	menu: MenuWithRecipes;
	actions?: ReactNode;
} & Omit<ComponentProps<"section">, "children">) {
	const { count, abvRange, priceRange, styleEntries } =
		getMenuComposition(menu);

	return (
		<section
			{...props}
			className={clsx(styles.masthead, className, {
				[styles.isFeatured]: menu.isFeatured,
			})}
		>
			<div aria-hidden="true" className={styles.badge}>
				<span className={styles.icon}>
					<Icon name={menu.isFeatured ? "star" : "memo-pad"} size={5} />
				</span>
			</div>

			<div className={styles.bevel}>
				<header className={styles.head}>
					{menu.isFeatured ? (
						<Text as="p" size={1} className={styles.overline}>
							Featured
						</Text>
					) : null}

					<Heading level="h1" size={7} serif>
						{getMenuName(menu)}
					</Heading>

					{menu.description ? (
						<Text as="p" size={3} serif balance className={styles.description}>
							{menu.description}
						</Text>
					) : null}

					<MenuRangeChips
						abvRange={abvRange}
						priceRange={priceRange}
						className={styles.chips}
					/>
				</header>

				<div className={styles.strip}>
					<Flex justifyContent="flex-end">
						<StatsLine overline={count === 1 ? "Recipe" : "Recipes"}>
							{count}
						</StatsLine>
					</Flex>

					{styleEntries.length > 0 ? (
						<>
							<CocktailStyleBar
								items={styleEntries}
								className={styles.styleBar}
							/>

							<Flex gap={1} wrap justifyContent="center">
								{styleEntries.map((item) => (
									<CocktailStyleChip
										key={item.label}
										style={item.style}
										count={item.count}
										variant="legend"
									/>
								))}
							</Flex>
						</>
					) : null}
				</div>
			</div>

			<footer className={styles.footer}>
				<div className={styles.meta}>
					<Text size={1} light className={styles.stat}>
						Created: <Time date={menu.createdAt} />
					</Text>

					{menu.updatedAt ? (
						<Text size={1} light className={styles.stat}>
							Updated: <Time date={menu.updatedAt} />
						</Text>
					) : null}
				</div>

				{actions}
			</footer>
		</section>
	);
}
