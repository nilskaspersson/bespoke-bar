import { Suspense } from "react";
import { BottomRailItems } from "@/components/BottomRail";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { CreateIngredientButton } from "@/features/ingredients/components/CreateIngredientButton";
import {
	IngredientSidebar,
	IngredientSidebarSkeleton,
} from "@/features/ingredients/components/IngredientSidebar";
import { LinkButton } from "@/ui/Button";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { authOrForbidden } from "@/utils/auth";
import { IngredientsShell } from "./IngredientsShell";
import styles from "./layout.module.css";

export default function IngredientsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<div className={styles.root}>
				<IngredientsShell>
					<aside className={styles.sidebar}>
						<Suspense fallback={<IngredientSidebarSkeleton />}>
							<SidebarWithData />
						</Suspense>
					</aside>

					<Grid as="section" gap={6} className={styles.content}>
						<nav className={styles.listNav}>
							<LinkButton
								href="/bar/ingredients"
								variant="solid"
								color="accent"
								size="small"
								startAdornment={<Icon name="arrow-left" size={2} />}
							>
								All Ingredients
							</LinkButton>
						</nav>

						{children}
					</Grid>
				</IngredientsShell>
			</div>

			<BottomRailItems>
				<CreateIngredientButton
					variant="clear"
					color="accent"
					rounded
					endAdornment={<Icon name="plus" />}
				>
					Create
				</CreateIngredientButton>
			</BottomRailItems>
		</>
	);
}

async function SidebarWithData() {
	const { orgId } = await authOrForbidden();
	const ingredients = await getCachedIngredients(orgId);

	return <IngredientSidebar ingredients={ingredients} />;
}
