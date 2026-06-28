import { Flex } from "@bespoke/ui/Flex";
import { Icon } from "@bespoke/ui/Icon";
import { Panel } from "@bespoke/ui/Panel";
import { Text } from "@bespoke/ui/Text";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";

export default function MenusPage() {
	return (
		<PageHeader
			tagline="Arrange your recipes into menus for service."
			overline="Menus"
			icon="duotone-memo-pad"
			heading="Compose a menu"
		>
			<Flex gap={6} alignItems="flex-start">
				<Panel
					header={
						<Flex alignItems="center" gap={2}>
							<Icon name="circle-info" size={3} />

							<Text heavy weight={600}>
								Organize
							</Text>
						</Flex>
					}
				>
					<Text as="p" size={3} heavy>
						Organize your Recipes in named Menus
					</Text>
				</Panel>

				<Panel
					header={
						<Flex alignItems="center" gap={2}>
							<Icon name="circle-info" size={3} />

							<Text heavy weight={600}>
								Export
							</Text>
						</Flex>
					}
					footer={
						<Text as="p" compact light size={1}>
							Supports Text or JSON formats.
						</Text>
					}
				>
					<Text as="p" size={3} heavy>
						Customized export of Menus and Recipes for various purposes.
					</Text>
				</Panel>

				<Panel
					header={
						<Flex alignItems="center" gap={2}>
							<Icon name="circle-info" size={3} />

							<Text heavy weight={600}>
								Calculate prices
							</Text>
						</Flex>
					}
				>
					<Text as="p" size={3} heavy>
						Set prices of Ingredients and Recipes to calculate profit.
					</Text>
				</Panel>
			</Flex>
		</PageHeader>
	);
}

export const metadata: Metadata = {
	title: "Menus",
};
