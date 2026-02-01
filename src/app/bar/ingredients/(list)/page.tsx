import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { IngredientTable } from "@/features/ingredients/components/IngredientsTable";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Icon } from "@/ui/Icon";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { authOrForbidden } from "@/utils/auth";
import { cacheTags } from "@/utils/cache";
import styles from "./page.module.css";

export default async function IngredientsPage() {
	const { orgId } = await authOrForbidden();

	return (
		<Container as="article" className={styles.container}>
			<PageHeader
				heading="Ingredients"
				actions={
					<LinkButton
						href="/bar/ingredients/create"
						variant="solid"
						color="accent"
						size="small"
					>
						Create Ingredient
						<Icon name="duotone-wine-bottle" />
					</LinkButton>
				}
			/>

			<Suspense fallback={<IngredientTableSkeleton />}>
				<IngredientsTableWithData orgId={orgId} />
			</Suspense>
		</Container>
	);
}

async function IngredientsTableWithData({ orgId }: { orgId: string }) {
	"use cache";
	cacheTag(...cacheTags.ingredientsList(orgId));

	const ingredients = await getCachedIngredients(orgId);

	return <IngredientTable ingredients={ingredients} />;
}

function IngredientTableSkeleton() {
	return (
		<SkeletonScreen>
			<Skeleton width="100%" height="100lvh" />
		</SkeletonScreen>
	);
}

export const metadata: Metadata = {
	title: "Ingredients",
};
