import { getClerkOrganization } from "@/features/organisation/actions/getClerkOrganization";
import { FALLBACK_BAR_NAME } from "@/features/organisation/constants";
import { Flex } from "@/ui/Flex";
import { Heading } from "@/ui/Heading";
import { Text } from "@/ui/Text";

export async function PageHeader({
	actions,
	heading,
}: {
	heading: string;
	actions?: React.ReactNode;
}) {
	const organization = await getClerkOrganization();

	return (
		<Flex
			as="header"
			justifyContent="space-between"
			alignItems="flex-end"
			wrap
			gap={4}
		>
			<hgroup>
				<Text size={2} light compact>
					{organization?.name || FALLBACK_BAR_NAME}
				</Text>

				<Heading level="h1">{heading}</Heading>
			</hgroup>

			{actions}
		</Flex>
	);
}
