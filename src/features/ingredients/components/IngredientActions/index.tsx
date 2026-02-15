import type { ComponentProps } from "react";
import { EntityActions } from "@/components/EntityActions";
import { ShareAction } from "@/components/ShareAction";
import type { Ingredient } from "@/db/schema/ingredients";
import { EditIngredientButton } from "@/features/ingredients/components/EditIngredientButton";
import { getIngredientUrl } from "@/features/ingredients/utils";
import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { getServerSideBaseURL } from "@/utils/url";

export function IngredientActions({
	ingredient,
	withLink,
	...props
}: {
	ingredient: Partial<Ingredient>;
	withLink?: boolean;
} & Omit<ComponentProps<typeof EntityActions>, "children">) {
	return (
		<EntityActions {...props}>
			{(actionProps) => (
				<>
					{withLink ? (
						<li>
							<LinkButton
								{...actionProps}
								href={getIngredientUrl(ingredient)}
								color="accent"
								prefetch={false}
							>
								<Icon name="arrow-right" size={1} />
								View
							</LinkButton>
						</li>
					) : null}

					<li>
						<EditIngredientButton
							{...actionProps}
							ingredient={ingredient}
							color="accent"
						>
							Edit
						</EditIngredientButton>
					</li>

					<li>
						<ShareAction
							{...actionProps}
							value={new URL(
								getIngredientUrl(ingredient),
								getServerSideBaseURL(),
							).toString()}
						>
							Share link
						</ShareAction>
					</li>
				</>
			)}
		</EntityActions>
	);
}
