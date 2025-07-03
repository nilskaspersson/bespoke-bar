import type { ComponentProps } from "react";
import type { BaseRecipe } from "@/db/schema/recipes";
import { calculateRecipeMetrics } from "@/features/recipes/utils/calculateRecipeMetrics";
import type { UnitSystems } from "@/features/units/utils/convert";
import { formatVolume } from "@/features/units/utils/formatVolume";
import { Text } from "@/ui/Text";
import { percentageFormatter } from "@/utils/formatting";

export function VolumeInfo<T extends BaseRecipe>({
	recipe,
	diluted = true,
	servings,
	convertUnits = "metric",
	...props
}: {
	recipe: T;
	diluted?: boolean;
	servings?: number;
	convertUnits?: UnitSystems | null;
} & Omit<ComponentProps<"details">, "children">) {
	const recipeMetrics = calculateRecipeMetrics(recipe, { servings });

	return (
		<details {...props}>
			<Text as="summary" size={1} compact>
				{typeof servings === "number" && servings === 1
					? "Volume per serving: "
					: `Total volume (${servings} servings): `}
				<Text heavy weight={600}>
					{formatVolume(
						diluted ? recipeMetrics.finalVolume : recipeMetrics.originalVolume,
						convertUnits,
					)}
				</Text>{" "}
				({diluted ? "diluted" : "undiluted"})
			</Text>

			<Text as="table" size={1}>
				<tbody>
					<tr>
						<th>Undiluted volume</th>
						<td>{formatVolume(recipeMetrics.originalVolume, convertUnits)}</td>
					</tr>

					<tr>
						<th>Dilution</th>
						<td>
							{percentageFormatter.format(
								recipeMetrics.dilutionOfOriginalVolume,
							)}{" "}
							{recipe.preparationMethod
								? `(${recipe.preparationMethod})`
								: null}
						</td>
					</tr>

					<tr>
						<th>Water</th>
						<td>{formatVolume(recipeMetrics.dilutionVolume, convertUnits)}</td>
					</tr>

					<tr>
						<th>Water percentage</th>
						<td>
							{percentageFormatter.format(recipeMetrics.dilutionOfFinalVolume)}
						</td>
					</tr>

					<tr>
						<th>Final volume</th>
						<td>{formatVolume(recipeMetrics.finalVolume, convertUnits)}</td>
					</tr>
				</tbody>
			</Text>
		</details>
	);
}
