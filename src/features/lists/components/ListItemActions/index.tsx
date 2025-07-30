import type { ActionProps } from "@/app/components/EntityActions";
import { ShareAction } from "@/app/components/ShareAction";
import type { RecipeList } from "@/db/schema/recipeLists";
import { clearFeaturedList } from "@/features/lists/actions/clearFeaturedList";
import { deleteRecipeList } from "@/features/lists/actions/deleteRecipeList";
import { setFeaturedList } from "@/features/lists/actions/setFeaturedList";
import { ClearFeaturedListButton } from "@/features/lists/components/ClearFeaturedListButton";
import { DeleteRecipeListButton } from "@/features/lists/components/DeleteRecipeListButton";
import { SetFeaturedListButton } from "@/features/lists/components/SetFeaturedListButton";
import { getRecipeListUrl } from "@/features/lists/utils";
import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { getServerSideBaseURL } from "@/utils/url";

export function ListItemActions({
	list,
	hasFeaturedList,
	recipeCount,
	deleteRedirectTo,
	...props
}: ActionProps & {
	list: RecipeList;
	recipeCount: number;
	hasFeaturedList?: boolean;
	deleteRedirectTo?: string;
}) {
	return (
		<>
			<li>
				<LinkButton {...props} href={getRecipeListUrl(list)} color="accent">
					<Icon name="arrow-right" size={1} />
					View
				</LinkButton>
			</li>

			<li>
				<LinkButton
					{...props}
					href={`/bar/lists/${list.id}/edit`}
					color="accent"
				>
					<Icon name="pen-to-square" size={1} />
					Edit
				</LinkButton>
			</li>

			<li>
				<ShareAction
					{...props}
					value={new URL(
						getRecipeListUrl(list),
						getServerSideBaseURL(),
					).toString()}
				>
					Share link
				</ShareAction>
			</li>

			<li>
				{list.isFeatured ? (
					<ClearFeaturedListButton
						{...props}
						list={list}
						actionSetFeatured={setFeaturedList}
						actionClearFeatured={clearFeaturedList}
						color="amber"
					>
						<Icon name="circle-xmark" />
						Remove Featured
					</ClearFeaturedListButton>
				) : (
					<SetFeaturedListButton
						{...props}
						list={list}
						hasFeaturedList={hasFeaturedList}
						actionSetFeatured={setFeaturedList}
						actionClearFeatured={clearFeaturedList}
						color="amber"
					>
						<Icon name="star" />
						Set Featured
					</SetFeaturedListButton>
				)}
			</li>

			<li>
				<DeleteRecipeListButton
					{...props}
					color="red"
					list={list}
					recipeCount={recipeCount}
					action={deleteRecipeList.bind(null, {
						id: list.id,
						redirectTo: deleteRedirectTo,
					})}
				>
					<Icon name="trash" />
					Delete
				</DeleteRecipeListButton>
			</li>
		</>
	);
}
