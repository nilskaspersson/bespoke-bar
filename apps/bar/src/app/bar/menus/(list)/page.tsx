import { authOrForbidden } from "@bespoke/api/auth";
import { cacheTags } from "@bespoke/api/cache";
import { getCachedMenus } from "@bespoke/api/menus/readBarMenus";
import { LinkButton } from "@bespoke/ui/Button";
import { Callout } from "@bespoke/ui/Callout";
import { Container } from "@bespoke/ui/Container";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { Icon } from "@bespoke/ui/Icon";
import { Text } from "@bespoke/ui/Text";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { type ReactNode, Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { MenuTable } from "@/features/menus/components/MenuTable";
import styles from "./page.module.css";

export default function MenusPage() {
	return (
		<Container as="article" className={styles.container}>
			<PageHeader heading="Menus">
				<LinkButton
					href="/bar/menus/create"
					variant="solid"
					color="accent"
					size="small"
				>
					Create Menu
					<Icon name="duotone-memo-pad" />
				</LinkButton>
			</PageHeader>

			<MenusPageContent>
				<Suspense fallback={<MenuTable.Skeleton />}>
					<MenusWithAuth />
				</Suspense>
			</MenusPageContent>
		</Container>
	);
}

async function MenusWithAuth() {
	const { orgId } = await authOrForbidden();

	return <MenuData orgId={orgId} />;
}

async function MenusPageContent({ children }: { children: ReactNode }) {
	"use cache";
	cacheLife("max");

	return (
		<>
			<Callout variant="inset" color="light" size={7}>
				<Grid gap={3}>
					<Heading level="h2" size={4}>
						Time for a new Cocktail Menu?
					</Heading>

					<Text as="p" size={3}>
						With{" "}
						<Text as="dfn" heavy weight={600}>
							Menus
						</Text>
						, you can further organize your recipes, set and calculate Recipe
						prices, generate menus for your guests, and more.
					</Text>
				</Grid>
			</Callout>

			{children}
		</>
	);
}

async function MenuData({ orgId }: { orgId: string }) {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.menus(orgId));

	const menus = await getCachedMenus(orgId);

	return <MenuTable menus={menus} />;
}

export const metadata: Metadata = {
	title: "Menus",
};
