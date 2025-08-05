import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { SwitchListView } from "@/app/components/SwitchListView";
import { readOrganisationMembers } from "@/features/organisation/actions/readOrganisationMembers";
import { getCachedBarRecipes } from "@/features/recipes/actions/readBarRecipes";
import {
	RecipeTable,
	RecipeTableSkeleton,
} from "@/features/recipes/components/RecipeTable";
import { StatLinks } from "@/features/recipes/components/StatLinks";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Flex } from "@/ui/Flex";
import { Icon } from "@/ui/Icon";
import { authOrForbidden } from "@/utils/auth";
import styles from "./page.module.css";

export default async function RecipesPage() {
	return (
		<Container as="article" className={styles.container}>
			<PageHeader
				heading="Recipes"
				actions={
					<LinkButton
						href="/bar/recipes/create/bulk"
						variant="solid"
						color="accent"
						size="small"
					>
						Create Recipe
						<Icon name="duotone-martini-glass" />
					</LinkButton>
				}
			/>

			<Flex
				as="aside"
				wrap
				gap={4}
				justifyContent="space-between"
				alignItems="center"
				className={styles.navigation}
			>
				<Suspense>
					<StatLinks />
				</Suspense>

				<div>
					<SwitchListView />
				</div>
			</Flex>

			<Suspense fallback={<RecipeTableSkeleton />}>
				<RecipeTableWithData />
			</Suspense>
		</Container>
	);
}

async function RecipeTableWithData() {
	const { orgId } = await authOrForbidden();

	const [recipes, members] = await Promise.all([
		getCachedBarRecipes(orgId),
		readOrganisationMembers(),
	]);

	return <RecipeTable recipes={recipes} members={members} />;
}

export const metadata: Metadata = {
	title: "Recipes",
};
