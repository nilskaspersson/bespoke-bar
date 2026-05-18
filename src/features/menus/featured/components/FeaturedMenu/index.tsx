import { EmptyArea } from "@/components/EmptyArea";
import { EntityActions } from "@/components/EntityActions";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { MenuActions } from "@/features/menus/actions/components/MenuActions";
import { MenuFilters } from "@/features/menus/components/MenuFilters";
import { MenuFrame } from "@/features/menus/components/MenuFrame";
import { getCachedFeaturedMenu } from "@/features/menus/featured/api/readFeaturedMenu";
import {
	buildIngredientMap,
	stitchMenuEntries,
} from "@/features/specs/utils/stitchIngredients";
import { LinkButton } from "@/ui/Button";
import { Grid, type GridProps } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Text } from "@/ui/Text";
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
						<MenuFilters menu={featuredMenu} />
					</MenuFrame>

					<EntityActions className={styles.actions}>
						{(actionProps) => (
							<MenuActions
								actionProps={actionProps}
								menu={featuredMenu}
								hasFeaturedMenu
								withLink
							/>
						)}
					</EntityActions>
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
						href="/bar/menus"
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
