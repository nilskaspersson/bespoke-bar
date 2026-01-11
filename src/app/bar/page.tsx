import { Suspense } from "react";
import { FeaturedList } from "@/features/lists/featured/components/FeaturedList";
import { CreateRecipeNav } from "@/features/recipes/components/CreateRecipeNav";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import styles from "./page.module.css";

export default async function BarPage() {
	return (
		<Container as="article" className={styles.container}>
			<Grid gap={8}>
				<hr />

				<Suspense
					fallback={
						<SkeletonScreen>
							<Grid gap={8} justifyItems="center">
								<Skeleton width="15ch" height="1.5rem" />
								<Skeleton width="100%" height="80lvh" />
							</Grid>
						</SkeletonScreen>
					}
				>
					<Heading level="h2" className={styles.subheading}>
						Featured List
					</Heading>

					<FeaturedList />
				</Suspense>

				<hr />

				<Heading level="h2" className={styles.subheading}>
					Create a Recipe
				</Heading>

				<CreateRecipeNav />
			</Grid>
		</Container>
	);
}
