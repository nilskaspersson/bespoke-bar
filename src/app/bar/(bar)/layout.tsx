import { AppSidebar } from "@/app/components/AppSidebar";
import { SecondaryNavigation } from "@/app/components/SecondaryNavigation";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import styles from "./layout.module.css";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
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
	);
}
