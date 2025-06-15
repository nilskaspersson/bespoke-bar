import { auth, clerkClient } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { BarNavigation } from "@/app/components/BarNavigation";
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

	return (
		<div className={styles.container}>
			<BarNavigation className={styles.navigation} />
			<div className={styles.main}>{children}</div>
		</div>
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

	const organizationName = organization.name || "Unknown bar";

	return {
		title: {
			template: `%s @ ${organizationName} :: Bespoke Bar`,
			default: `Mise en place @ ${organizationName}`,
		},
		authors: undefined, // TODO: Add bar members
	};
}
