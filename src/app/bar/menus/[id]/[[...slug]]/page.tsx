import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EntityActions } from "@/components/EntityActions";
import { PageHeader } from "@/components/PageHeader";
import {
	buildIngredientMap,
	stitchMenuEntries,
} from "@/features/ingredientLines/utils/stitchIngredients";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { MenuActions } from "@/features/menus/actions/components/MenuActions";
import { getCachedMenu } from "@/features/menus/api/readMenu";
import { EmptyMenuEntry } from "@/features/menus/components/EmptyMenuEntry";
import { MenuFilters } from "@/features/menus/components/MenuFilters";
import { MenuFrame } from "@/features/menus/components/MenuFrame";
import { getCachedFeaturedMenuId } from "@/features/menus/featured/api/readFeaturedMenu";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { authOrForbidden } from "@/utils/auth";
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
		<Container as="article" className={styles.container}>
			<PageHeader heading="Recipe Menu" />

			<Suspense fallback={<div>Loading...</div>}>
				<MenuContent params={params} />
			</Suspense>
		</Container>
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
			<MenuFrame level="h2" menu={menu} className={styles.frame}>
				<Grid gap={8}>
					<MenuFilters menu={menu} editable withActions />
					<EmptyMenuEntry menu={menu} />
				</Grid>
			</MenuFrame>

			<EntityActions className={styles.actions}>
				{(actionProps) => (
					<MenuActions
						actionProps={actionProps}
						menu={menu}
						hasFeaturedMenu={featuredMenuId !== null}
						deleteRedirectTo={"/bar/menus"}
					/>
				)}
			</EntityActions>
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
			canonical: `/bar/menus/${menu.id}`,
		},
	};
}
