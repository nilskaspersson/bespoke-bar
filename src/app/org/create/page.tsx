import { CreateOrganization } from "@clerk/nextjs";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import styles from "./page.module.css";

export default function CreateOrgPage() {
	return (
		<section className={styles.base}>
			<AnimatedBackground />

			<CreateOrganization afterCreateOrganizationUrl="/bar" />
		</section>
	);
}
