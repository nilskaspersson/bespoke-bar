import { AnimatedBackground } from "@bespoke/ui/AnimatedBackground";
import { CreateOrganization } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default async function CreateOrgPage() {
	const { orgId } = await auth.protect();

	if (orgId) {
		redirect("/recipes");
	}

	return (
		<section className={styles.base}>
			<AnimatedBackground />

			<CreateOrganization
				skipInvitationScreen
				afterCreateOrganizationUrl="/recipes"
			/>
		</section>
	);
}
