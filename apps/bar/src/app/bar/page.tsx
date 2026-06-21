import { authOrForbidden } from "@bespoke/api/auth";
import { cacheLife } from "next/cache";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { FeaturedMenu } from "@/features/menus/featured/components/FeaturedMenu";
import { CreateRecipeNav } from "@/features/recipes/components/CreateRecipeNav";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import styles from "./page.module.css";

export default function BarPage() {
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
