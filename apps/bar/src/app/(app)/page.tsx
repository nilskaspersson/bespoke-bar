import { authOrForbidden } from "@bespoke/api/auth";
import { Container } from "@bespoke/ui/Container";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { Skeleton, SkeletonScreen } from "@bespoke/ui/Skeleton";
import { cacheLife } from "next/cache";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { FeaturedMenu } from "@/features/menus/featured/components/FeaturedMenu";
import { CreateRecipeNav } from "@/features/recipes/components/CreateRecipeNav";
import styles from "./page.module.css";

export default function BarPage() {
	redirect("/recipes");

	return (
		<BarPageShell>
			<Suspense
				fallback={
					<SkeletonScreen>
						<Skeleton width="100%" height="80lvh" />
					</SkeletonScreen>
				}
			>
				<FeaturedMenuWithAuth />
			</Suspense>
		</BarPageShell>
	);
}

async function FeaturedMenuWithAuth() {
	const { orgId } = await authOrForbidden();
	return <FeaturedMenu orgId={orgId} />;
}

async function BarPageShell({ children }: { children: ReactNode }) {
	"use cache";
	cacheLife("max");

	return (
		<Container as="article" className={styles.container}>
			<Grid gap={8}>
				<hr />

				<Heading level="h2" className={styles.subheading}>
					Featured Menu
				</Heading>

				{children}

				<hr />

				<Heading level="h2" className={styles.subheading}>
					Create a Recipe
				</Heading>

				<CreateRecipeNav />
			</Grid>
		</Container>
	);
}
