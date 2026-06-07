import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { CreateIngredientButton } from "@/features/ingredients/components/CreateIngredientButton";
import { LinkButton } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { Flex } from "@/ui/Flex";

export default function IngredientsPage() {
	return (
		<PageHeader
			tagline="Curate Ingredients for your Recipes."
			overline="Ingredients"
			icon="duotone-wine-bottle"
			heading="Stock the bar"
		>
			<Flex gap={4}>
				<CreateIngredientButton variant="outline" color="accent">
					Create ingredient
				</CreateIngredientButton>

				<LinkButton href="/bar/recipes/create" variant="solid" color="accent">
					Create Recipe
				</LinkButton>
			</Flex>

			<Callout color="accent" size={2} icon="circle-info">
				Ingredients are also created automatically when you create Recipes.
			</Callout>
		</PageHeader>
	);
}

export const metadata: Metadata = {
	title: "Ingredients",
};
