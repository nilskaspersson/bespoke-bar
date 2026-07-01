import { authOrForbidden } from "@bespoke/api/auth";
import { getCachedIngredients } from "@bespoke/api/ingredients/readIngredients";
import { getCachedFeaturedMenuId } from "@bespoke/api/menus/featured/readFeaturedMenu";
import { getCachedMenu } from "@bespoke/api/menus/readMenu";
import {
	buildIngredientMap,
	stitchMenuEntries,
} from "@bespoke/domain/ingredientLines/stitchIngredients";
import { Grid } from "@bespoke/ui/Grid";
import { Skeleton } from "@bespoke/ui/Skeleton";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BottomRailItems } from "@/components/BottomRail";
import { EntityActions } from "@/components/EntityActions";
import { MenuDetailActions } from "@/features/menus/actions/components/MenuDetailActions";
import { MenuRailActions } from "@/features/menus/actions/components/MenuRailActions";
import { EmptyMenuEntry } from "@/features/menus/components/EmptyMenuEntry";
import { MenuMasthead } from "@/features/menus/components/MenuMasthead";
import { MenuAddRecipeSlot } from "@/features/menus/entries/components/MenuAddRecipeSlot";
import { MenuEntryList } from "@/features/menus/entries/components/MenuEntryList";
import { isValidPageUrl } from "@/utils/url";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string; slug?: string[] }>;
};

/**
 * [[...slug]] enables suffixing the URL with a slug of the menu name for
 * improved readability of links.
 */
export default function MenuPage({ params }: Props) {
	return (
		<article className={styles.detail}>
			<Suspense fallback={<MenuPageSkeleton />}>
				<MenuContent params={params} />
			</Suspense>
		</article>
	);
}

function MenuPageSkeleton() {
	return (
		<Skeleton variant="block" height="408px" className={styles.skeleton} />
	);
}

async function MenuContent({ params }: Props) {
	const { id, slug } = await params;

	if (!isValidPageUrl(id, slug) || !id) {
		notFound();
	}

	const { orgId } = await authOrForbidden();

	const [rawMenu, featuredMenuId, ingredients] = await Promise.all([
		getCachedMenu(orgId, id),
		getCachedFeaturedMenuId(orgId),
		getCachedIngredients(orgId),
	]);

	if (!rawMenu) {
		notFound();
	}

	const menu = stitchMenuEntries(rawMenu, buildIngredientMap(ingredients));

	return (
		<>
			<Grid gap={9}>
				<MenuMasthead
					menu={menu}
					actions={
						<EntityActions actionProps={{ size: "small" }}>
							{(actionProps) => (
								<MenuDetailActions
									menu={menu}
									hasFeaturedMenu={featuredMenuId !== null}
									actionProps={actionProps}
								/>
							)}
						</EntityActions>
					}
				/>

				{menu.entries.length > 0 ? (
					<MenuEntryList
						entries={menu.entries}
						editable
						withActions
						trailingSlot={<MenuAddRecipeSlot menu={menu} />}
					/>
				) : (
					<EmptyMenuEntry menu={menu} />
				)}
			</Grid>

			<BottomRailItems>
				<MenuRailActions menu={menu} />
			</BottomRailItems>
		</>
	);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;

	if (!id) {
		return {
			title: "Menu not found",
		};
	}

	const { orgId } = await authOrForbidden();
	const menu = await getCachedMenu(orgId, id);

	if (!menu) {
		return {
			title: "Menu not found",
		};
	}

	return {
		title: menu.name || "Unnamed Menu",
		alternates: {
			canonical: `/menus/${menu.id}`,
		},
	};
}
