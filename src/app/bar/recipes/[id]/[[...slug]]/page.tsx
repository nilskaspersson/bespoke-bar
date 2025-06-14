import { clerkClient } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
	archiveRecipe,
	unarchiveRecipe,
} from "@/features/recipes/actions/archiveRecipe";
import { deleteRecipe } from "@/features/recipes/actions/deleteRecipe";
import { readRecipe } from "@/features/recipes/actions/readRecipe";
import { DeleteRecipe } from "@/features/recipes/components/DeleteRecipe";
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

/**
 * [[...slug]] enables suffixing the URL with a slug of the recipe name for
 * improved readability of links.
 */
export default async function RecipePage({ params }: Props) {
	const { id } = await params;
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

						<DeleteRecipe
							recipe={recipe}
							action={deleteRecipe.bind(null, {
								id: recipe.id,
								redirectTo: "/bar/recipes",
							})}
						>
							<Icon name="trash" /> Delete
						</DeleteRecipe>

						<LinkButton href={`/bar/recipes/${id}/edit`}>
							<Icon name="pen" /> Edit
						</LinkButton>
					</Flex>
				</Flex>

				<ul>
					{recipe.specs.map((spec) => (
						<li key={spec.id}>
							{spec.quantity} {spec.unit} {spec.ingredientId}
						</li>
					))}
				</ul>
			</Grid>
		</Container>
	);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	const recipe = await readRecipe(id);

	if (!recipe) {
		return {
			title: "Recipe not found",
		};
	}

	const client = await clerkClient();
	const user = await client.users.getUser(recipe.createdBy);

	return {
		title: recipe.name || "Unnamed Recipe",
		/**
		 * We often generate links with a human-readable suffix of the recipe name. Add a
		 * canonical reference to the plain URL with only the recipe ID.
		 */
		alternates: {
			canonical: `/bar/recipes/${recipe.id}`,
		},
		authors: {
			name: user.fullName || "Unknown bartender",
		},
	};
}
