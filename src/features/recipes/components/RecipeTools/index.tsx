import type { ComponentProps } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import {
	COCKTAIL_STYLE_TO_LABEL,
	GLASSWARE_TO_LABEL,
	METHOD_TO_LABEL,
} from "@/features/recipes/constants";
import { Text } from "@/ui/Text";

export function RecipeTools({
	recipe,
	...props
}: { recipe: RecipeWithSpecs } & Omit<ComponentProps<"dl">, "children">) {
	return (
		<dl {...props}>
			<div>
				<Text as="dt" size={0} compact>
					Style
				</Text>

				<Text as="dd" size={2} heavy weight={500}>
					{recipe.style ? COCKTAIL_STYLE_TO_LABEL.get(recipe.style) : "-"}
				</Text>
			</div>

			<div>
				<Text as="dt" size={0} compact>
					Method
				</Text>

				<Text as="dd" size={2} heavy weight={500}>
					{recipe.preparationMethod
						? METHOD_TO_LABEL.get(recipe.preparationMethod)
						: "-"}
				</Text>
			</div>

			<div>
				<Text as="dt" size={0} compact>
					Glassware
				</Text>

				<Text as="dd" size={2} heavy weight={500}>
					{recipe.glassware ? GLASSWARE_TO_LABEL.get(recipe.glassware) : "-"}
				</Text>
			</div>

			<div>
				<Text as="dt" size={0} compact>
					Garnish
				</Text>

				<Text as="dd" size={2} heavy weight={500}>
					{recipe.garnish ?? "-"}
				</Text>
			</div>
		</dl>
	);
}
