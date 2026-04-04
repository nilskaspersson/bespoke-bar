import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SwitchListView } from "@/components/SwitchListView";
import { StatLinks } from "@/features/recipes/components/StatLinks";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Flex } from "@/ui/Flex";
import { Icon } from "@/ui/Icon";
import { authOrForbidden } from "@/utils/auth";
import styles from "./layout.module.css";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<Container as="article" className={styles.container}>
			<PageHeader
				heading="Recipes"
				actions={
					<LinkButton
						href="/bar/recipes/create"
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
					<StatLinksWithAuth />
				</Suspense>

				<Suspense>
					<SwitchListView />
				</Suspense>
			</Flex>

			{children}
		</Container>
	);
}

async function StatLinksWithAuth() {
	const { orgId, userId } = await authOrForbidden();
	return <StatLinks orgId={orgId} userId={userId} />;
}
