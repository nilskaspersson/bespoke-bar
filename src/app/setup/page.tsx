import { CreateOrganization } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import styles from "./page.module.css";

export default async function CreateOrgPage() {
	const { orgId } = await auth.protect();

	if (orgId) {
		redirect("/bar");
	}

	return (
		<section className={styles.base}>
			<AnimatedBackground />

			<CreateOrganization
				skipInvitationScreen
				afterCreateOrganizationUrl="/bar"
			/>
		</section>
	);
}
