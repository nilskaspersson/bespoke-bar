import type { ActionProps } from "@/app/components/EntityActions";
import { ShareAction } from "@/app/components/ShareAction";
import type { RecipeList } from "@/db/schema/recipeLists";
import { getRecipeListUrl } from "@/features/lists/utils";
import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { getServerSideBaseURL } from "@/utils/url";

export function ListItemActions({
	list,
	...props
}: ActionProps & { list: RecipeList }) {
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
		</>
	);
}
