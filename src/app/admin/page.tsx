import { DeleteOrgForm } from "@/app/admin/DeleteOrgForm";
import { GrantOCRQuotaForm } from "@/app/admin/GrantOCRQuotaForm";
import { GrantSlotsForm } from "@/app/admin/GrantSlotsForm";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/ui/Container";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { adminOrForbidden } from "@/utils/admin";
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

				<Flex wrap gap={5} alignItems="flex-start">
					<Grid as="section" gap={3} className={styles.section}>
						<Heading level="h2" size={4}>
							Grant recipe slots
						</Heading>
						<GrantSlotsForm defaultOrgId={orgId} />
					</Grid>

					<Grid as="section" gap={3} className={styles.section}>
						<Heading level="h2" size={4}>
							Grant OCR quota
						</Heading>
						<GrantOCRQuotaForm defaultOrgId={orgId} />
					</Grid>

					<Grid as="section" gap={3} className={styles.section}>
						<Heading level="h2" size={4}>
							Delete bar
						</Heading>
						<DeleteOrgForm />
					</Grid>
				</Flex>
			</Grid>
		</Container>
	);
}
