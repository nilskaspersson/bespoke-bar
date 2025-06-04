"use client";

import { useOrganization } from "@clerk/nextjs";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";

export default function BarPage() {
	const { organization } = useOrganization();

	return (
		<Container as="article">
			<Heading level="h1">{organization?.name}</Heading>
		</Container>
	);
}
