import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import {
	IngredientTable,
	IngredientTableSkeleton,
} from "@/features/ingredients/components/IngredientsTable";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Icon } from "@/ui/Icon";
import { authOrForbidden } from "@/utils/auth";
import { cacheTags } from "@/utils/cache";
import styles from "./page.module.css";

export default function IngredientsPage() {
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
				<IngredientsWithAuth />
			</Suspense>
		</Container>
	);
}

async function IngredientsWithAuth() {
	const { orgId } = await authOrForbidden();

	return <IngredientsTableWithData orgId={orgId} />;
}

async function IngredientsTableWithData({ orgId }: { orgId: string }) {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.ingredientsList(orgId));

	const ingredients = await getCachedIngredients(orgId);

	return <IngredientTable ingredients={ingredients} />;
}

export const metadata: Metadata = {
	title: "Ingredients",
};
