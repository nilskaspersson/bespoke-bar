import { OrganizationSwitcher as ClerkOrganizationSwitcher } from "@clerk/nextjs";
import { AuthProvider } from "@/app/components/AuthProvider";
import { OrganisationSettings } from "@/features/organisation/components/OrganisationSettings";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

export function OrganisationSwitcher() {
	return (
		<AuthProvider>
			<ClerkOrganizationSwitcher hidePersonal hideSlug>
				<ClerkOrganizationSwitcher.OrganizationProfilePage
					label="Locale & Currency"
					url="settings"
					labelIcon={<Icon name="gear" className={styles.icon} />}
				>
					<OrganisationSettings />
				</ClerkOrganizationSwitcher.OrganizationProfilePage>
			</ClerkOrganizationSwitcher>
		</AuthProvider>
	);
}
