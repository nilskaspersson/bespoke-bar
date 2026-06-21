import { authOrForbidden } from "@bespoke/api/auth";
import { getCachedIngredients } from "@bespoke/api/ingredients/readIngredients";
import { getCachedMenu } from "@bespoke/api/menus/readMenu";
import { getCachedBarRecipes } from "@bespoke/api/recipes/readBarRecipes";
import {
	buildIngredientMap,
	stitchMenuEntries,
} from "@bespoke/domain/ingredientLines/stitchIngredients";
import { stitchRecipes } from "@bespoke/domain/recipes/stitchRecipe";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BottomRailItems } from "@/components/BottomRail";
import { MENU_FORM_ID, MenuForm } from "@/features/menus/components/MenuForm";
import { getMenuUrl } from "@/features/menus/utils";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { SubmitButton } from "@/ui/SubmitButton";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string }>;
};

export default function EditMenuPage({ params: paramsPromise }: Props) {
	return (
		<Container as="article" className={styles.container}>
			<Grid gap={4}>
				<Heading level="h1">Edit Menu</Heading>

				<Suspense
					fallback={
						<SkeletonScreen>
							<Skeleton width="100%" height="40lvh" />
						</SkeletonScreen>
					}
				>
					<EditMenuWithAuth paramsPromise={paramsPromise} />
				</Suspense>
			</Grid>

			<BottomRailItems>
				<SubmitButton
					variant="solid"
					color="accent"
					form={MENU_FORM_ID}
					rounded
				>
					<Icon name="pen" />
					Save changes
				</SubmitButton>
			</BottomRailItems>
		</Container>
	);
}

async function EditMenuWithAuth({
	paramsPromise,
}: {
	paramsPromise: Promise<{ id?: string }>;
}) {
	const { id } = await paramsPromise;

	if (!id) {
		notFound();
	}

	const { orgId } = await authOrForbidden();

	const [rawMenu, rawRecipes, ingredients] = await Promise.all([
		getCachedMenu(orgId, id),
		getCachedBarRecipes(orgId),
		getCachedIngredients(orgId),
	]);

	if (!rawMenu) {
		notFound();
	}

	const menu = stitchMenuEntries(rawMenu, buildIngredientMap(ingredients));
	const recipes = stitchRecipes(rawRecipes, { ingredients });

	return (
		<>
			<nav>
				<LinkButton
					href={getMenuUrl(menu)}
					variant="text"
					color="accent"
					size="small"
				>
					<Icon name="angle-left" />
					Back to Menu
				</LinkButton>
			</nav>

			<MenuForm menu={menu} recipes={recipes} />
		</>
	);
}
