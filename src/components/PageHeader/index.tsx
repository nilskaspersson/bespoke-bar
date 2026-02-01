import { OrganizationNameLoader } from "@/components/OrganizationName/loader";
import { Flex } from "@/ui/Flex";
import { Heading } from "@/ui/Heading";
import { HGroup } from "@/ui/HGroup";

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
			<HGroup overline={<OrganizationNameLoader />}>
				<Heading level="h1">{heading}</Heading>
			</HGroup>

			{actions}
		</Flex>
	);
}
