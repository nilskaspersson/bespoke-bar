import type { Metadata } from "next";
import { OrganisationProfilePanel } from "@/features/organisation/components/OrganisationProfilePanel";
import { Container } from "@/ui/Container";

export default function SettingsPage() {
	return (
		<Container as="article" padding={false}>
			<OrganisationProfilePanel />
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Settings",
};
