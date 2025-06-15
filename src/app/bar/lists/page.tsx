import type { Metadata } from "next";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";

export default function ListsPage() {
	return (
		<Container as="article">
			<Heading level="h1">Lists</Heading>
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Lists",
};
