import { adminOrForbidden } from "@bespoke/api/admin";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { AdminConsole } from "./AdminConsole";
import styles from "./page.module.css";

export default async function AdminPage() {
	const { orgId } = await adminOrForbidden();

	return (
		<Container as="article" className={styles.root}>
			<Grid gap={8}>
				<PageHeader
					overline="Internal"
					icon="gear"
					heading="Admin"
					tagline="Have fun."
				/>

				<AdminConsole currentOrgId={orgId} />
			</Grid>
		</Container>
	);
}
