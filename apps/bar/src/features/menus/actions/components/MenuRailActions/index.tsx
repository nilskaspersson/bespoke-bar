import type { MenuWithEntries } from "@bespoke/schema/schema/composite";
import { Icon } from "@bespoke/ui/Icon";
import { DeleteMenuButton } from "@/features/menus/actions/components/DeleteMenuButton";
import { ExportMenuButton } from "@/features/menus/actions/components/ExportMenuButton";
import { deleteMenu } from "@/features/menus/api/deleteMenu";

export function MenuRailActions({
	menu,
	deleteRedirectTo = "/menus",
}: {
	menu: MenuWithEntries;
	deleteRedirectTo?: string;
}) {
	return (
		<>
			<ExportMenuButton
				menu={menu}
				variant="clear"
				color="heavy"
				rounded
				endAdornment={<Icon name="arrow-down-from-line" />}
			>
				Export
			</ExportMenuButton>

			<DeleteMenuButton
				menu={menu}
				action={deleteMenu.bind(null, {
					id: menu.id,
					redirectTo: deleteRedirectTo,
				})}
				variant="clear"
				color="red"
				size="default"
				rounded
				icon
			>
				<Icon name="trash" />
			</DeleteMenuButton>
		</>
	);
}
