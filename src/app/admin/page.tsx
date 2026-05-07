import { DeleteOrgForm } from "@/app/admin/DeleteOrgForm";
import { GrantSlotsForm } from "@/app/admin/GrantSlotsForm";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";
import { adminOrForbidden } from "@/utils/admin";

export default async function AdminPage() {
	const { orgId } = await adminOrForbidden();

	return (
		<Container as="article">
			<Heading level="h1">Admin</Heading>

			<section>
				<Heading level="h2">Grant recipe slots</Heading>
				<GrantSlotsForm defaultOrgId={orgId} />
			</section>

			<section>
				<Heading level="h2">Delete bar</Heading>
				<DeleteOrgForm />
			</section>
		</Container>
	);
}
