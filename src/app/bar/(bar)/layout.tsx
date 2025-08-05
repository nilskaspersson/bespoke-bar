import { BarNavigation } from "@/app/components/BarNavigation";
import { SecondaryNavigation } from "@/app/components/SecondaryNavigation";
import styles from "./layout.module.css";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<div className={styles.container}>
				<SecondaryNavigation className={styles.navigation} />

				<div className={styles.main}>{children}</div>
			</div>

			<BarNavigation className={styles.barNavigation} />
		</>
	);
}
