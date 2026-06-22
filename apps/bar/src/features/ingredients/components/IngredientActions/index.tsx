import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { LinkButton } from "@bespoke/ui/Button";
import { Icon } from "@bespoke/ui/Icon";
import type { ComponentProps } from "react";
import { EntityActions } from "@/components/EntityActions";
import { ShareAction } from "@/components/ShareAction";
import { EditIngredientButton } from "@/features/ingredients/components/EditIngredientButton";
import { getIngredientUrl } from "@/features/ingredients/utils";

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
