import { cacheLife } from "next/cache";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { FeaturedList } from "@/features/lists/featured/components/FeaturedList";
import { CreateRecipeNav } from "@/features/recipes/components/CreateRecipeNav";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { authOrForbidden } from "@/utils/auth";
import styles from "./page.module.css";

export default async function BarPage() {
	const { orgId } = await authOrForbidden();

	return (
		<BarPageShell>
			<Suspense
				fallback={
					<SkeletonScreen>
						<Skeleton width="100%" height="80lvh" />
					</SkeletonScreen>
				}
			>
				<FeaturedList orgId={orgId} />
			</Suspense>
		</BarPageShell>
	);
}

async function BarPageShell({ children }: { children: ReactNode }) {
	"use cache";
	cacheLife("max");

	return (
		<Container as="article" className={styles.container}>
			<Grid gap={8}>
				<hr />

				<Heading level="h2" className={styles.subheading}>
					Featured List
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
