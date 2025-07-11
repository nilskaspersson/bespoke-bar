import type { RecipeWithSpecs } from "@/db/schema/recipes";
import {
	archiveRecipe,
	unarchiveRecipe,
} from "@/features/recipes/actions/archiveRecipe";
import { deleteRecipe } from "@/features/recipes/actions/deleteRecipe";
import { DeleteRecipe } from "@/features/recipes/components/DeleteRecipe";
import { LinkButton } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
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
	);
}
