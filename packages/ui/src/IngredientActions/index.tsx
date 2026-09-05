import { getIngredientUrl } from "@bespoke/domain/ingredients/getIngredientUrl";
import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import type { ComponentProps } from "react";
import { LinkButton } from "../Button";
import { EditIngredientButton } from "../EditIngredientButton";
import { EntityActions } from "../EntityActions";
import { Icon } from "../Icon";
import { ShareAction } from "../ShareAction";

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
								endAdornment={<Icon name="arrow-right" size={1} />}
							>
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
							Quick edit
						</EditIngredientButton>
					</li>

					<li>
						<ShareAction {...actionProps} value={getIngredientUrl(ingredient)}>
							Share link
						</ShareAction>
					</li>
				</>
			)}
		</EntityActions>
	);
}
