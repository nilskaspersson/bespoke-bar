import type { MenuEntry } from "@bespoke/schema/schema/menuEntries";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { Icon } from "@bespoke/ui/Icon";
import { Text } from "@bespoke/ui/Text";
import { getDifferentKeys, pick } from "@/utils";

type Props = {
	a: MenuEntry;
	b: MenuEntry;
};

const ENTRY_KEYS = ["price", "sortOrder", "recipeId"] as const;

const LABELS = {
	price: "Price",
	sortOrder: "Sort Order",
	recipeId: "Recipe",
} as const;

export function MenuEntryDiff({ a, b }: Props) {
	const diff = getDifferentKeys(pick(a, ...ENTRY_KEYS), pick(b, ...ENTRY_KEYS));

	return (
		<Grid as="dl" gap={2}>
			{diff.map((key) => {
				const valueA = a[key];
				const valueB = b[key];

				return (
					<Flex key={key} gap={1} alignItems="baseline">
						<Text as="dt" compact>
							{LABELS[key]}:
						</Text>

						<Text as="dd" compact size={1} weight={500}>
							<Flex gap={1} alignItems="center">
								<del>{valueA}</del>
								<Icon name="arrow-right" size={0} />
								<ins>{valueB}</ins>
							</Flex>
						</Text>
					</Flex>
				);
			})}
		</Grid>
	);
}
