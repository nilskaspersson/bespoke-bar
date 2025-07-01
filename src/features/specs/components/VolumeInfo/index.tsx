import type { ComponentProps } from "react";
import type { BaseRecipe } from "@/db/schema/recipes";
import { calculateRecipeMetrics } from "@/features/recipes/utils/calculateRecipeMetrics";
import { formatVolume } from "@/features/units/utils/formatVolume";
import { Text } from "@/ui/Text";
import { percentageFormatter } from "@/utils/formatting";

export function VolumeInfo<T extends BaseRecipe>({
	recipe,
	...props
}: { recipe: T } & ComponentProps<"details">) {
	const recipeMetrics = calculateRecipeMetrics(recipe);

	return (
		<details {...props}>
			<Text as="summary" size={1} compact>
				Volume: {formatVolume(recipeMetrics.originalVolume)} (
				{formatVolume(recipeMetrics.finalVolume)} diluted)
			</Text>

			<Text size={1} as="div">
				Dilution volume: {formatVolume(recipeMetrics.dilutionVolume)}
				<br />
				Dilution target:{" "}
				{percentageFormatter.format(recipeMetrics.dilutionOfFinalVolume)}
			</Text>
		</details>
	);
}
