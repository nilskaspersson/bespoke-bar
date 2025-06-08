import { notFound } from "next/navigation";
import {
	archiveRecipe,
	unarchiveRecipe,
} from "@/features/recipes/actions/archiveRecipe";
import { deleteRecipe } from "@/features/recipes/actions/deleteRecipe";
import { readRecipe } from "@/features/recipes/actions/readRecipe";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";

type Props = {
	params: Promise<{ id?: string }>;
};

export default async function RecipePage({ params: paramsPromise }: Props) {
	const { id } = await paramsPromise;
	const recipe = await readRecipe(id);

	if (!recipe) {
		notFound();
	}

	return (
		<Container as="article">
			<Grid gap={4}>
				<Flex justifyContent="space-between" gap={4}>
					<Heading level="h1">
						<RecipeName recipe={recipe} />
					</Heading>

					<Flex gap={2}>
						{recipe.archivedAt ? (
							<form action={unarchiveRecipe.bind(null, { id: recipe.id })}>
								<SubmitButton>Unarchive</SubmitButton>
							</form>
						) : (
							<form
								action={archiveRecipe.bind(null, {
									id: recipe.id,
									redirectTo: "/bar/recipes",
								})}
							>
								<SubmitButton>Archive</SubmitButton>
							</form>
						)}

						<form
							action={deleteRecipe.bind(null, {
								id: recipe.id,
								redirectTo: "/bar/recipes",
							})}
						>
							<SubmitButton>
								<Icon name="trash" /> Delete
							</SubmitButton>
						</form>

						<LinkButton href={`/bar/recipes/${id}/edit`}>
							<Icon name="pen" /> Edit
						</LinkButton>
					</Flex>
				</Flex>

				<ul>
					{recipe.specs.map((spec) => (
						<li key={spec.id}>
							{spec.quantity} {spec.unit} {spec.ingredient}
						</li>
					))}
				</ul>
			</Grid>
		</Container>
	);
}
