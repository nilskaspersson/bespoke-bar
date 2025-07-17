import { auth, clerkClient } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { BarNavigation } from "@/app/components/BarNavigation";
import { Providers } from "@/app/components/Providers";
import { SecondaryNavigation } from "@/app/components/SecondaryNavigation";
import { getOrCreateLocalOrganisation } from "@/features/organisation/actions/getOrCreateLocalOrganisation";
import { FALLBACK_BAR_NAME } from "@/features/organisation/constants";
import styles from "./layout.module.css";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { userId, redirectToSignIn } = await auth();

	if (!userId) {
		return redirectToSignIn();
	}

	const organisation = await getOrCreateLocalOrganisation();

	return (
		<>
			<div className={styles.container}>
				<SecondaryNavigation className={styles.navigation} />

				<div className={styles.main}>
					<Providers organisation={organisation}>{children}</Providers>
				</div>
			</div>

			<BarNavigation className={styles.barNavigation} />
		</>
	);
}

export async function generateMetadata(): Promise<Metadata> {
	const { orgId } = await auth();

	if (!orgId) {
		return {
			title: "Unknown bar",
		};
	}

	const client = await clerkClient();

	const organization = await client.organizations.getOrganization({
		organizationId: orgId,
	});

	const organizationName = organization.name || FALLBACK_BAR_NAME;

	return {
		title: {
			template: `%s @ ${organizationName} :: Bespoke Bar`,
			default: `Mise en place @ ${organizationName}`,
		},
		authors: undefined, // TODO: Add bar members
	};
}
