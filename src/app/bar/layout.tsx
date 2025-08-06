import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Providers } from "@/app/components/Providers";
import { getClerkOrganization } from "@/features/organisation/actions/getClerkOrganization";
import { getOrCreateLocalOrganisation } from "@/features/organisation/actions/getOrCreateLocalOrganisation";
import { FALLBACK_BAR_NAME } from "@/features/organisation/constants";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { userId, orgId, redirectToSignIn } = await auth();

	if (!userId) {
		return redirectToSignIn();
	}

	const organisation = await getOrCreateLocalOrganisation(orgId, userId);

	return <Providers organisation={organisation}>{children}</Providers>;
}

export async function generateMetadata(): Promise<Metadata> {
	const organization = await getClerkOrganization();

	if (!organization) {
		return {
			title: "Unknown bar",
		};
	}

	const organizationName = organization.name || FALLBACK_BAR_NAME;

	return {
		title: {
			template: `%s @ ${organizationName} :: Bespoke Bar`,
			default: `Mise en place @ ${organizationName}`,
		},
		authors: undefined, // TODO: Add bar members
	};
}
