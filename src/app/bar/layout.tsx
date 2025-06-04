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
		<div className={styles.container}>
			<BarNavigation className={styles.navigation} />
			<div className={styles.main}>{children}</div>
		</div>
	);
}
