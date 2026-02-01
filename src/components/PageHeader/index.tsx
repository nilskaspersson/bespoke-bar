import { Suspense } from "react";
import { getClerkOrganization } from "@/features/organisation/api/getClerkOrganization";
import { FALLBACK_BAR_NAME } from "@/features/organisation/constants";
import { Flex } from "@/ui/Flex";
import { Heading } from "@/ui/Heading";
import { Text } from "@/ui/Text";

export function PageHeader({
	actions,
	heading,
}: {
	heading: string;
	actions?: React.ReactNode;
}) {
	return (
		<Flex
			as="header"
			justifyContent="space-between"
			alignItems="flex-end"
			wrap
			gap={4}
		>
			<hgroup>
				<Suspense fallback={<Text size={2} light compact>&nbsp;</Text>}>
					<OrganizationName />
				</Suspense>

				<Heading level="h1">{heading}</Heading>
			</hgroup>

			{actions}
		</Flex>
	);
}

async function OrganizationName() {
	const organization = await getClerkOrganization();

	return (
		<Text size={2} light compact>
			{organization?.name || FALLBACK_BAR_NAME}
		</Text>
	);
}
