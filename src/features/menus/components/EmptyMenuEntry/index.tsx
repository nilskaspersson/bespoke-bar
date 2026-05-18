import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { EmptyArea } from "@/components/EmptyArea";
import type { Menu } from "@/db/schema/menus";
import { AddRecipeDialog } from "@/features/menus/entries/components/AddRecipeDialog";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

export function EmptyMenuEntry({
	className,
	menu,
	...props
}: Omit<ComponentProps<typeof EmptyArea>, "children"> & { menu: Menu }) {
	return (
		<EmptyArea
			color="light"
			className={clsx(styles.base, className)}
			{...props}
		>
			<AddRecipeDialog
				menu={menu}
				size="small"
				variant="outline"
				color="light"
				className={styles.button}
			>
				<Icon name="plus" size={2} />
				Add recipe to menu
			</AddRecipeDialog>
		</EmptyArea>
	);
}
