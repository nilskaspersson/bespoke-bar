import { auth } from "@clerk/nextjs/server";
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
		<section>
			<BarNavigation className={styles.navigation} />
			<section className={styles.main}>{children}</section>
		</section>
	);
}
