import type { Metadata } from "next";
import { Suspense } from "react";
import { BottomRailItems } from "@/components/BottomRail";
import { PageHeader } from "@/components/PageHeader";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import {
	RECIPE_LIST_FORM_ID,
	RecipeListForm,
} from "@/features/lists/components/RecipeListForm";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
import { stitchRecipes } from "@/features/recipes/utils/stitchRecipe";
import { Container } from "@/ui/Container";
import { Icon } from "@/ui/Icon";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { SubmitButton } from "@/ui/SubmitButton";
import { authOrForbidden } from "@/utils/auth";
import styles from "./page.module.css";

export default function CreateListPage() {
	return (
		<Container as="article" className={styles.container}>
			<PageHeader heading="Create List" />

			<Suspense
				fallback={
					<SkeletonScreen>
						<Skeleton width="100%" height="40lvh" />
					</SkeletonScreen>
				}
			>
				<CreateListWithAuth />
			</Suspense>

			<BottomRailItems>
				<SubmitButton
					variant="solid"
					color="accent"
					form={RECIPE_LIST_FORM_ID}
					rounded
				>
					<Icon name="plus" />
					Create List
				</SubmitButton>
			</BottomRailItems>
		</Container>
	);
}

async function CreateListWithAuth() {
	const { orgId } = await authOrForbidden();
	const [rawRecipes, ingredients] = await Promise.all([
		getCachedBarRecipes(orgId),
		getCachedIngredients(orgId),
	]);

	const recipes = stitchRecipes(rawRecipes, { ingredients });

	return <RecipeListForm recipes={recipes} />;
}

export const metadata: Metadata = {
	title: "Create List",
};
