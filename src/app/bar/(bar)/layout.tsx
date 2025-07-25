import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { BarNavigation } from "@/app/components/BarNavigation";
import { Providers } from "@/app/components/Providers";
import { SecondaryNavigation } from "@/app/components/SecondaryNavigation";
import { getClerkOrganization } from "@/features/organisation/actions/getClerkOrganization";
import { getOrCreateLocalOrganisation } from "@/features/organisation/actions/getOrCreateLocalOrganisation";
import { FALLBACK_BAR_NAME } from "@/features/organisation/constants";
import { Toaster } from "@/ui/Toast/Toaster";
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

			<Toaster />
		</>
	);
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
