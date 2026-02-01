import { Suspense } from "react";
import { getClerkOrganization } from "@/features/organisation/api/getClerkOrganization";
import { FALLBACK_BAR_NAME } from "@/features/organisation/constants";
import { Flex } from "@/ui/Flex";
import { Heading } from "@/ui/Heading";
import { HGroup } from "@/ui/HGroup";
import { Skeleton } from "@/ui/Skeleton";
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
			<HGroup
				overline={
					<Suspense
						fallback={<Skeleton width="16ch" height="13px" variant="text" />}
					>
						<OrganizationName />
					</Suspense>
				}
			>
				<Heading level="h1">{heading}</Heading>
			</HGroup>

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
