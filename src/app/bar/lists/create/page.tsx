import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { RecipeListForm } from "@/features/lists/components/RecipeListForm";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
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
		</Container>
	);
}

async function CreateListWithAuth() {
	const { orgId } = await authOrForbidden();
	const recipes = await getCachedBarRecipes(orgId);

	return (
		<RecipeListForm recipes={recipes}>
			<SubmitButton variant="solid" color="accent">
				<Icon name="plus" />
				Create List
			</SubmitButton>
		</RecipeListForm>
	);
}

export const metadata: Metadata = {
	title: "Create List",
};
