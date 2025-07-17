import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";

export default function ListsPage() {
	notFound();

	return (
		<Container as="article">
			<Heading level="h1">Lists</Heading>
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Lists",
};
