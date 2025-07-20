import type { RecipeWithSpecs } from "@/db/schema/recipes";
import {
	archiveRecipe,
	unarchiveRecipe,
} from "@/features/recipes/actions/archiveRecipe";
import { deleteRecipe } from "@/features/recipes/actions/deleteRecipe";
import { ArchiveRecipeButton } from "@/features/recipes/components/ArchiveRecipeButton";
import { DeleteRecipe } from "@/features/recipes/components/DeleteRecipe";
import { UnarchiveRecipeButton } from "@/features/recipes/components/UnarchiveRecipeButton";
import { LinkButton } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

export function RecipeActions({ recipe }: { recipe: RecipeWithSpecs }) {
	return (
		<Flex gap={2} justifyContent="center" className={styles.actions}>
			<LinkButton
				href={`/bar/recipes/${recipe.id}/edit`}
				variant="outline"
				color="heavy"
				size="small"
			>
				<Icon name="pen-to-square" /> Edit
			</LinkButton>

			{recipe.archivedAt ? (
				<UnarchiveRecipeButton
					recipe={recipe}
					actionUnarchive={unarchiveRecipe}
					actionArchive={archiveRecipe}
					variant="ghost"
					color="light"
					size="small"
				>
					Unarchive
				</UnarchiveRecipeButton>
			) : (
				<ArchiveRecipeButton
					recipe={recipe}
					actionArchive={archiveRecipe}
					actionUnarchive={unarchiveRecipe}
					variant="ghost"
					color="light"
					size="small"
				>
					Archive
				</ArchiveRecipeButton>
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
	);
}
