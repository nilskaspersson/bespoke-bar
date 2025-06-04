import { DraftSpecs } from "@/features/specs/components/DraftSpecs";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";

export default function CreateRecipePage() {
	return (
		<Container as="article">
			<Heading level="h1">Create Recipe</Heading>

			<DraftSpecs />
		</Container>
	);
}
