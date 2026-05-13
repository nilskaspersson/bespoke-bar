"use client";

import { RecipeCocktailStyleChip } from "@/features/recipes/components/RecipeCocktailStyleChip";
import type { CocktailStyleFilter } from "@/features/recipes/constants";
import { Flex } from "@/ui/Flex";
import { Text } from "@/ui/Text";

type Props = {
	styles: CocktailStyleFilter[];
	selectedStyles: CocktailStyleFilter[];
	onToggleStyle: (style: CocktailStyleFilter) => void;
	label?: string;
	emptyLabel?: string;
};

export function RecipeCocktailStyleCloud({
	styles,
	selectedStyles,
	onToggleStyle,
	label = "Available cocktail styles",
	emptyLabel = "No cocktail styles available",
}: Props) {
	if (styles.length === 0) {
		return (
			<Text as="p" size={2} light>
				{emptyLabel}
			</Text>
		);
	}

	return (
		<Flex as="ul" wrap gap={2} aria-label={label}>
			{styles.map((style) => (
				<li key={style ?? "unclassified"}>
					<RecipeCocktailStyleChip
						style={style}
						selected={selectedStyles.includes(style)}
						onClick={() => onToggleStyle(style)}
					/>
				</li>
			))}
		</Flex>
	);
}
