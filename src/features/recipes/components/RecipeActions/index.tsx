import type { ComponentProps } from "react";
import { EntityActions } from "@/app/components/EntityActions";
import { ShareAction } from "@/app/components/ShareAction";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { CreateRecipeEntryDialog } from "@/features/lists/components/CreateRecipeEntryDialog";
import { deleteRecipe } from "@/features/recipes/actions/deleteRecipe";
import { ArchiveRecipeButton } from "@/features/recipes/components/ArchiveRecipeButton";
import { DeleteRecipe } from "@/features/recipes/components/DeleteRecipe";
import { UnarchiveRecipeButton } from "@/features/recipes/components/UnarchiveRecipeButton";
import { getRecipeUrl } from "@/features/recipes/utils";
import { CopySpecsToClipboard } from "@/features/specs/components/CopySpecsToClipboard";
import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { ToggleModalButton } from "@/ui/ToggleModalButton";
import { getServerSideBaseURL } from "@/utils/url";

export function RecipeActions({
	recipe,
	withLink,
	...props
}: { recipe: RecipeWithSpecs; withLink?: boolean } & Omit<
	ComponentProps<typeof EntityActions>,
	"children"
>) {
	return (
		<EntityActions {...props}>
			{(actionProps) => (
				<>
					{withLink ? (
						<li>
							<LinkButton
								{...actionProps}
								href={getRecipeUrl(recipe)}
								color="accent"
							>
								<Icon name="arrow-right" size={1} />
								View
							</LinkButton>
						</li>
					) : null}

					<li>
						<LinkButton
							{...actionProps}
							href={`/bar/recipes/${recipe.id}/edit`}
							prefetch={false}
							color="accent"
						>
							<Icon name="pen-to-square" size={1} />
							Edit
						</LinkButton>
					</li>

					<li>
						<ToggleModalButton
							{...actionProps}
							label={
								<>
									<Icon name="plus" size={1} /> Add to list
								</>
							}
						>
							<CreateRecipeEntryDialog recipe={recipe} />
						</ToggleModalButton>
					</li>

					<li>
						<CopySpecsToClipboard
							{...actionProps}
							specs={recipe.specs}
							iconSize={1}
						>
							Copy specs
						</CopySpecsToClipboard>
					</li>

					<li>
						{recipe.archivedAt ? (
							<UnarchiveRecipeButton {...actionProps} recipe={recipe}>
								<Icon name="box-archive" size={1} />
								Unarchive
							</UnarchiveRecipeButton>
						) : (
							<ArchiveRecipeButton
								{...actionProps}
								color="amber"
								recipe={recipe}
							>
								<Icon name="box-archive" size={1} />
								Archive
							</ArchiveRecipeButton>
						)}
					</li>

					<li>
						<DeleteRecipe
							buttonProps={actionProps}
							recipe={recipe}
							action={deleteRecipe.bind(null, {
								id: recipe.id,
								redirectTo: "/bar/recipes",
							})}
						>
							<Icon name="trash" size={1} /> Delete
						</DeleteRecipe>
					</li>

					<li>
						<ShareAction
							{...actionProps}
							value={new URL(
								getRecipeUrl(recipe),
								getServerSideBaseURL(),
							).toString()}
						>
							Share link
						</ShareAction>
					</li>
				</>
			)}
		</EntityActions>
	);

	// return (
	// 	<Flex gap={2} justifyContent="center" className={styles.actions}>
	// 		<LinkButton
	// 			href={`/bar/recipes/${recipe.id}/edit`}
	// 			variant="outline"
	// 			color="heavy"
	// 			size="small"
	// 		>
	// 			<Icon name="pen-to-square" /> Edit
	// 		</LinkButton>

	// 		<DeleteRecipe
	// 			recipe={recipe}
	// 			action={deleteRecipe.bind(null, {
	// 				id: recipe.id,
	// 				redirectTo: "/bar/recipes",
	// 			})}
	// 		>
	// 			<Icon name="trash" /> Delete
	// 		</DeleteRecipe>
	// 	</Flex>
	// );
}
