import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { AppSidebar } from "@/components/AppSidebar";
import { Providers } from "@/components/Providers";
import { SecondaryNavigation } from "@/components/SecondaryNavigation";
import { getClerkOrganization } from "@/features/organisation/api/getClerkOrganization";
import { getOrCreateLocalOrganisation } from "@/features/organisation/api/getOrCreateLocalOrganisation";
import { FALLBACK_BAR_NAME } from "@/features/organisation/constants";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import styles from "./layout.module.css";

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

	return (
		<Providers organisation={organisation}>
			<div className={styles.container}>
				<AppSidebar
					className={styles.navigation}
					toggle={
						<Button variant="base" size="tiny" className={styles.toggle}>
							<Icon name="bars" size={2} />
						</Button>
					}
				>
					<SecondaryNavigation />
				</AppSidebar>

				<div className={styles.main}>{children}</div>
			</div>
		</Providers>
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
