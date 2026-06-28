import type { MenuWithEntries } from "@bespoke/schema/schema/composite";
import { Icon } from "@bespoke/ui/Icon";
import type { ActionProps } from "@/components/EntityActions";
import { ShareAction } from "@/components/ShareAction";
import { ClearFeaturedMenuButton } from "@/features/menus/actions/components/ClearFeaturedMenuButton";
import { SetFeaturedMenuButton } from "@/features/menus/actions/components/SetFeaturedMenuButton";
import { EditMenuButton } from "@/features/menus/components/EditMenuButton";
import { clearFeaturedMenu } from "@/features/menus/featured/api/clearFeaturedMenu";
import { setFeaturedMenu } from "@/features/menus/featured/api/setFeaturedMenu";
import { getMenuUrl } from "@/features/menus/utils";

export function MenuDetailActions({
	menu,
	hasFeaturedMenu,
	actionProps,
}: {
	menu: MenuWithEntries;
	hasFeaturedMenu?: boolean;
	actionProps: ActionProps;
}) {
	return (
		<>
			<li>
				<EditMenuButton menu={menu} {...actionProps}>
					<Icon name="pen-to-square" size={1} />
					Edit
				</EditMenuButton>
			</li>

			<li>
				<ShareAction {...actionProps} value={getMenuUrl(menu)}>
					Share link
				</ShareAction>
			</li>

			<li>
				{menu.isFeatured ? (
					<ClearFeaturedMenuButton
						{...actionProps}
						menu={menu}
						actionSetFeatured={setFeaturedMenu}
						actionClearFeatured={clearFeaturedMenu}
						requireConfirmation
						color="amber"
					>
						<Icon name="star-off" size={1} />
						Unfeature
					</ClearFeaturedMenuButton>
				) : (
					<SetFeaturedMenuButton
						{...actionProps}
						menu={menu}
						hasFeaturedMenu={hasFeaturedMenu}
						actionSetFeatured={setFeaturedMenu}
						actionClearFeatured={clearFeaturedMenu}
						requireConfirmation={hasFeaturedMenu}
						color="amber"
					>
						<Icon name="star" size={1} />
						Set Featured
					</SetFeaturedMenuButton>
				)}
			</li>
		</>
	);
}
