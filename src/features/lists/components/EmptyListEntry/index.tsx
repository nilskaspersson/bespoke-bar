import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { EmptyArea } from "@/components/EmptyArea";
import type { RecipeList } from "@/db/schema/recipeLists";
import { AddRecipeDialog } from "@/features/lists/entries/components/AddRecipeDialog";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

export function EmptyListEntry({
	className,
	list,
	...props
}: Omit<ComponentProps<typeof EmptyArea>, "children"> & { list: RecipeList }) {
	return (
		<EmptyArea
			adornment={<Icon name="plus" size={4} />}
			color="light"
			className={clsx(styles.base, className)}
			{...props}
		>
			<AddRecipeDialog
				list={list}
				size="small"
				variant="outline"
				color="light"
				className={styles.button}
			>
				<Icon name="plus" size={2} />
				Add recipe to list
			</AddRecipeDialog>
		</EmptyArea>
	);
}
