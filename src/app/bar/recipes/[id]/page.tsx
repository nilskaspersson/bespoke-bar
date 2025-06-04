import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";

type Args = {
	params: Promise<{ id?: string }>;
};

export default async function RecipePage({ params: paramsPromise }: Args) {
	const { id } = await paramsPromise;

	return (
		<Container>
			<Heading level="h1">Recipe {id}</Heading>
		</Container>
	);
}
