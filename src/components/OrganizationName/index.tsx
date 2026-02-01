"use client";

import { useOrganization } from "@clerk/nextjs";
import { Skeleton } from "@/ui/Skeleton";
import { Text } from "@/ui/Text";

export function OrganizationName() {
	const { organization } = useOrganization();

	if (!organization) {
		return null;
	}

	return (
		<Text size={2} light compact>
			{organization.name}
		</Text>
	);
}

export function OrganizationNameSkeleton() {
	return <Skeleton width="16ch" height="13px" variant="text" />;
}

OrganizationName.Skeleton = OrganizationNameSkeleton;
