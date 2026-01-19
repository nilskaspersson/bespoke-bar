import type { ActionProps } from "@/components/EntityActions";
import { ShareAction } from "@/components/ShareAction";
import type { RecipeListWithEntries } from "@/db/schema/composite";
import { ClearFeaturedListButton } from "@/features/lists/actions/components/ClearFeaturedListButton";
import { DeleteRecipeListButton } from "@/features/lists/actions/components/DeleteRecipeListButton";
import { ExportListButton } from "@/features/lists/actions/components/ExportListButton";
import { SetFeaturedListButton } from "@/features/lists/actions/components/SetFeaturedListButton";
import { deleteRecipeList } from "@/features/lists/api/deleteRecipeList";
import { clearFeaturedList } from "@/features/lists/featured/api/clearFeaturedList";
import { setFeaturedList } from "@/features/lists/featured/api/setFeaturedList";
import { getRecipeListUrl } from "@/features/lists/utils";
import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { getServerSideBaseURL } from "@/utils/url";

export function RecipeListActions({
	list,
	hasFeaturedList,
	deleteRedirectTo,
	withLink,
	actionProps,
}: {
	actionProps: ActionProps;
	list: RecipeListWithEntries;
	hasFeaturedList?: boolean;
	deleteRedirectTo?: string;
	withLink?: boolean;
}) {
	return (
		<>
			{withLink ? (
				<li>
					<LinkButton
						{...actionProps}
						href={getRecipeListUrl(list)}
						color="accent"
					>
						<Icon name="arrow-right" size={1} />
						View
					</LinkButton>
				</li>
			) : null}

			<li>
				<LinkButton
					{...actionProps}
					href={`/bar/lists/${list.id}/edit`}
					color="accent"
				>
					<Icon name="pen-to-square" size={1} />
					Edit
				</LinkButton>
			</li>

			<li>
				<ShareAction
					{...actionProps}
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
						{...actionProps}
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
						{...actionProps}
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
					{...actionProps}
					color="red"
					list={list}
					action={deleteRecipeList.bind(null, {
						id: list.id,
						redirectTo: deleteRedirectTo,
					})}
				>
					<Icon name="trash" />
					Delete
				</DeleteRecipeListButton>
			</li>

			<li>
				<ExportListButton {...actionProps} list={list}>
					<Icon name="arrow-down-from-line" />
					Export list
				</ExportListButton>
			</li>
		</>
	);
}
