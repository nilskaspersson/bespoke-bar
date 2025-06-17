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
import { isValidRecipeParams } from "@/features/recipes/utils";
import { calculateRecipeMetrics } from "@/features/recipes/utils/calculateRecipeMetrics";
import { formatVolume } from "@/features/units/utils/formatVolume";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { Text } from "@/ui/Text";
import { percentageFormatter } from "@/utils/formatting";

type Props = {
	params: Promise<{ id?: string; slug?: string[] }>;
};

/**
 * [[...slug]] enables suffixing the URL with a slug of the recipe name for
 * improved readability of links.
 */
export default async function RecipePage({ params }: Props) {
	const { id, slug } = await params;

	if (!isValidRecipeParams(id, slug)) {
		notFound();
	}

	const recipe = await readRecipe(id);

	if (!recipe) {
		notFound();
	}

	const recipeMetrics = calculateRecipeMetrics(recipe);

	return (
		<Container as="article">
			<Grid gap={4}>
				<Flex justifyContent="space-between" gap={4}>
					<Heading level="h1">
						<RecipeName recipe={recipe} />
					</Heading>

					<Flex gap={2}>
						<LinkButton
							href={`/bar/recipes/${id}/edit`}
							variant="outline"
							color="heavy"
							size="small"
						>
							<Icon name="pen" /> Edit
						</LinkButton>

						{recipe.archivedAt ? (
							<form action={unarchiveRecipe.bind(null, { id: recipe.id })}>
								<SubmitButton variant="solid" color="heavy" size="small">
									Unarchive
								</SubmitButton>
							</form>
						) : (
							<form
								action={archiveRecipe.bind(null, {
									id: recipe.id,
									redirectTo: "/bar/recipes",
								})}
							>
								<SubmitButton variant="ghost" color="light" size="small">
									Archive
								</SubmitButton>
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
					</Flex>
				</Flex>

				<ul>
					{recipe.specs.map((spec) => (
						<li key={spec.id}>
							{spec.quantity} {spec.unit} {spec.ingredient.name}
						</li>
					))}
				</ul>

				<Text>Abv: {percentageFormatter.format(recipeMetrics.abv)}</Text>

				<Text>
					Original volume: {formatVolume(recipeMetrics.originalVolume)} <br />
					Final volume: {formatVolume(recipeMetrics.finalVolume)} (
					{formatVolume(recipeMetrics.dilutionVolume)} dilution,{" "}
					{percentageFormatter.format(recipeMetrics.dilutionOfFinalVolume)}{" "}
					dilution)
				</Text>
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
