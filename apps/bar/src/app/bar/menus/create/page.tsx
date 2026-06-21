import { stitchRecipes } from "@bespoke/domain/recipes/stitchRecipe";
import type { Metadata } from "next";
import { Suspense } from "react";
import { BottomRailItems } from "@/components/BottomRail";
import { PageHeader } from "@/components/PageHeader";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { MENU_FORM_ID, MenuForm } from "@/features/menus/components/MenuForm";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
import { Container } from "@/ui/Container";
import { Icon } from "@/ui/Icon";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { SubmitButton } from "@/ui/SubmitButton";
import { authOrForbidden } from "@/utils/auth";
import styles from "./page.module.css";

export default function CreateMenuPage() {
	return (
		<Container as="article" className={styles.container}>
			<PageHeader heading="Create Menu" />

			<Suspense
				fallback={
					<SkeletonScreen>
						<Skeleton width="100%" height="40lvh" />
					</SkeletonScreen>
				}
			>
				<CreateMenuWithAuth />
			</Suspense>

			<BottomRailItems>
				<SubmitButton
					variant="solid"
					color="accent"
					form={MENU_FORM_ID}
					rounded
				>
					<Icon name="plus" />
					Create Menu
				</SubmitButton>
			</BottomRailItems>
		</Container>
	);
}

async function CreateMenuWithAuth() {
	const { orgId } = await authOrForbidden();
	const [rawRecipes, ingredients] = await Promise.all([
		getCachedBarRecipes(orgId),
		getCachedIngredients(orgId),
	]);

	const recipes = stitchRecipes(rawRecipes, { ingredients });

	return <MenuForm recipes={recipes} />;
}

export const metadata: Metadata = {
	title: "Create Menu",
};
