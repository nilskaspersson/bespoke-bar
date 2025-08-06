import { Suspense } from "react";
import { FeaturedList } from "@/app/components/FeaturedList";
import { WelcomeMessage } from "@/app/components/WelcomeMessage";
import { Container } from "@/ui/Container";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import styles from "./page.module.css";

export default async function BarPage() {
	return (
		<Container as="article" className={styles.container}>
			<WelcomeMessage />

			<Suspense
				fallback={
					<SkeletonScreen>
						<Skeleton width="100%" height="80lvh" />
					</SkeletonScreen>
				}
			>
				<FeaturedList />
			</Suspense>
		</Container>
	);
}
