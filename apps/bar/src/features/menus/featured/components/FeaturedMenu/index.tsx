import { getCachedIngredients } from "@bespoke/api/ingredients/readIngredients";
import { getCachedFeaturedMenu } from "@bespoke/api/menus/featured/readFeaturedMenu";
import {
	buildIngredientMap,
	stitchMenuEntries,
} from "@bespoke/domain/ingredientLines/stitchIngredients";
import { LinkButton } from "@bespoke/ui/Button";
import { Flex } from "@bespoke/ui/Flex";
import { Grid, type GridProps } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { Icon } from "@bespoke/ui/Icon";
import { Text } from "@bespoke/ui/Text";
import { EmptyArea } from "@/components/EmptyArea";
import { MenuFrame } from "@/features/menus/components/MenuFrame";
import { MenuEntryList } from "@/features/menus/entries/components/MenuEntryList";
import { getMenuUrl } from "@/features/menus/utils";
import styles from "./styles.module.css";

type FeaturedMenuProps = Omit<GridProps, "children"> & {
	orgId: string;
};

/**
 * Not a `'use cache'` boundary on purpose: an outer cache would inherit
 * `getCachedIngredients`'s tags and invalidate on every ingredient mutation.
 */
export async function FeaturedMenu({ orgId, ...props }: FeaturedMenuProps) {
	const [rawMenu, ingredients] = await Promise.all([
		getCachedFeaturedMenu(orgId),
		getCachedIngredients(orgId),
	]);

	const featuredMenu = rawMenu
		? stitchMenuEntries(rawMenu, buildIngredientMap(ingredients))
		: null;

	return (
		<Grid as="section" gap={6} {...props}>
			{featuredMenu ? (
				<div>
					<MenuFrame menu={featuredMenu} className={styles.menu}>
						<MenuEntryList entries={featuredMenu.entries} />
					</MenuFrame>

					<Flex className={styles.actions} justifyContent="center">
						<LinkButton
							href={getMenuUrl(featuredMenu)}
							variant="solid"
							color="accent"
							size="small"
						>
							View menu
							<Icon name="arrow-right" size={1} />
						</LinkButton>
					</Flex>
				</div>
			) : (
				<EmptyArea color="amber">
					<Heading level="h3" size={6}>
						No Featured Menu
					</Heading>

					<Text size={2}>
						You can select a Featured Menu to be displayed for easy access.
					</Text>

					<LinkButton
						href="/menus"
						variant="outline"
						color="amber"
						size="small"
					>
						Select a Menu to feature
					</LinkButton>
				</EmptyArea>
			)}
		</Grid>
	);
}
