import type { MenuWithEntries } from "@bespoke/schema/schema/composite";
import { EntityActions } from "@/components/EntityActions";
import { MenuActions } from "@/features/menus/actions/components/MenuActions";
import { MenuFrame } from "@/features/menus/components/MenuFrame";
import { getMenuUrl } from "@/features/menus/utils";
import { Grid, type GridProps } from "@/ui/Grid";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import styles from "./styles.module.css";

type Props = {
	menus: MenuWithEntries[];
};

export function MenuTable({
	menus,
	...props
}: Props & Omit<GridProps, "menu" | "children">) {
	const hasFeaturedMenu = menus.some((menu) => menu.isFeatured);

	return (
		<Grid as="ul" gap={6} {...props}>
			{menus.map((menu) => (
				<li key={menu.id}>
					<MenuFrame
						menu={menu}
						href={getMenuUrl(menu)}
						className={styles.frame}
					/>

					<EntityActions className={styles.actions}>
						{(actionProps) => (
							<MenuActions
								actionProps={actionProps}
								menu={menu}
								hasFeaturedMenu={hasFeaturedMenu}
								withLink
							/>
						)}
					</EntityActions>
				</li>
			))}
		</Grid>
	);
}

function MenuTableSkeletonItem() {
	return (
		<li>
			<Skeleton width="100%" height="257px" className={styles.frame} />

			<div className={styles.actions}>
				<Skeleton variant="text" width="430px" height="24px" />
			</div>
		</li>
	);
}

MenuTable.Skeleton = function MenuTableSkeleton() {
	return (
		<SkeletonScreen>
			<Grid as="ul" gap={6}>
				<MenuTableSkeletonItem />
				<MenuTableSkeletonItem />
			</Grid>
		</SkeletonScreen>
	);
};
