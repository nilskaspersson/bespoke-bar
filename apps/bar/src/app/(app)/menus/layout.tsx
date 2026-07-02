import { authOrForbidden } from "@bespoke/api/auth";
import { getCachedMenus } from "@bespoke/api/menus/readBarMenus";
import { LinkButton } from "@bespoke/ui/Button";
import { Grid } from "@bespoke/ui/Grid";
import { Icon } from "@bespoke/ui/Icon";
import { Suspense } from "react";
import { BottomRailItems } from "@/components/BottomRail";
import { CreateMenuButton } from "@/features/menus/components/CreateMenuButton";
import {
	MenuSidebar,
	MenuSidebarSkeleton,
} from "@/features/menus/components/MenuSidebar";
import styles from "./layout.module.css";
import { MenusShell } from "./MenusShell";

export default function MenusLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<div className={styles.root}>
				<MenusShell>
					<aside className={styles.sidebar}>
						<Suspense fallback={<MenuSidebarSkeleton />}>
							<SidebarWithData />
						</Suspense>
					</aside>

					<Grid as="section" gap={6} className={styles.content}>
						<nav className={styles.listNav}>
							<LinkButton
								href="/menus"
								variant="solid"
								color="accent"
								size="small"
								startAdornment={<Icon name="arrow-left" size={2} />}
							>
								All Menus
							</LinkButton>
						</nav>

						{children}
					</Grid>
				</MenusShell>
			</div>

			<BottomRailItems>
				<CreateMenuButton
					variant="clear"
					color="accent"
					rounded
					endAdornment={<Icon name="plus" />}
				>
					Create
				</CreateMenuButton>
			</BottomRailItems>
		</>
	);
}

async function SidebarWithData() {
	const { orgId } = await authOrForbidden();
	const menus = await getCachedMenus(orgId);

	return <MenuSidebar menus={menus} />;
}
