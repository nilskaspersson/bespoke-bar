import type { Menu } from "@bespoke/schema/schema/menus";
import { Flex } from "@bespoke/ui/Flex";
import { Icon } from "@bespoke/ui/Icon";
import { Text } from "@bespoke/ui/Text";
import { AddRecipeDialog } from "@/features/menus/entries/components/AddRecipeDialog";
import styles from "./styles.module.css";

export function MenuAddRecipeSlot({ menu }: { menu: Menu }) {
	return (
		<AddRecipeDialog menu={menu} variant="base" className={styles.slot}>
			<Flex gap={2} alignItems="center">
				<Icon name="plus" size={3} />

				<Text as="div" size={3} heavy weight={600} compact>
					Add Recipe
				</Text>
			</Flex>
		</AddRecipeDialog>
	);
}
