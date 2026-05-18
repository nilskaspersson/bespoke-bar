import { cacheLife } from "next/cache";
import type { ActionProps } from "@/components/EntityActions";
import { ShareAction } from "@/components/ShareAction";
import type { MenuWithEntries } from "@/db/schema/composite";
import { ClearFeaturedMenuButton } from "@/features/menus/actions/components/ClearFeaturedMenuButton";
import { DeleteMenuButton } from "@/features/menus/actions/components/DeleteMenuButton";
import { ExportMenuButton } from "@/features/menus/actions/components/ExportMenuButton";
import { SetFeaturedMenuButton } from "@/features/menus/actions/components/SetFeaturedMenuButton";
import { deleteMenu } from "@/features/menus/api/deleteMenu";
import { clearFeaturedMenu } from "@/features/menus/featured/api/clearFeaturedMenu";
import { setFeaturedMenu } from "@/features/menus/featured/api/setFeaturedMenu";
import { getMenuUrl } from "@/features/menus/utils";
import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";

export async function MenuActions({
	menu,
	hasFeaturedMenu,
	deleteRedirectTo,
	withLink,
	actionProps,
}: {
	actionProps: ActionProps;
	menu: MenuWithEntries;
	hasFeaturedMenu?: boolean;
	deleteRedirectTo?: string;
	withLink?: boolean;
}) {
	"use cache";
	cacheLife("max");

	return (
		<>
			{withLink ? (
				<li>
					<LinkButton {...actionProps} href={getMenuUrl(menu)} color="accent">
						<Icon name="arrow-right" size={1} />
						View
					</LinkButton>
				</li>
			) : null}

			<li>
				<LinkButton
					{...actionProps}
					href={`/bar/menus/${menu.id}/edit`}
					color="accent"
				>
					<Icon name="pen-to-square" size={1} />
					Edit
				</LinkButton>
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
						<Icon name="circle-xmark" />
						Remove Featured
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
						<Icon name="star" />
						Set Featured
					</SetFeaturedMenuButton>
				)}
			</li>

			<li>
				<DeleteMenuButton
					{...actionProps}
					color="red"
					menu={menu}
					action={deleteMenu.bind(null, {
						id: menu.id,
						redirectTo: deleteRedirectTo,
					})}
				>
					<Icon name="trash" />
					Delete
				</DeleteMenuButton>
			</li>

			<li>
				<ExportMenuButton {...actionProps} menu={menu}>
					<Icon name="arrow-down-from-line" />
					Export menu
				</ExportMenuButton>
			</li>
		</>
	);
}
