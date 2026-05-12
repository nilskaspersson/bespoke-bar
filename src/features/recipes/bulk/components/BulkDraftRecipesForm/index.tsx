"use client";

import { clsx } from "clsx";
import { CLEAR_EDITOR_COMMAND, type LexicalEditor } from "lexical";
import { useRouter } from "next/navigation";
import {
	type HTMLAttributes,
	useCallback,
	useDeferredValue,
	useMemo,
	useRef,
	useState,
} from "react";
import type { RecipeFormData } from "@/db/schema/composite";
import type { Ingredient } from "@/db/schema/ingredients";
import type { Recipe } from "@/db/schema/recipes";
import { PreviewRecipesDialog } from "@/features/recipes/bulk/components/PreviewRecipesDialog";
import { RecipeEditor } from "@/features/recipes/bulk/components/RecipeEditor";
import { useCreateBulkDraftRecipes } from "@/features/recipes/bulk/hooks/useCreateBulkDraftRecipes";
import { useBulkDraftTextToBaseRecipes } from "@/features/recipes/bulk/hooks/useFormatBulkDraftRecipes";
import { useDialog } from "@/hooks/useDialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { Kbd } from "@/ui/Kbd";
import { SubmitButton } from "@/ui/SubmitButton";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

const DRAFT_STORAGE_KEY = "recipe-editor-draft";

export function BulkDraftRecipesForm({
	className,
	ingredients,
	createRecipes,
	...props
}: {
	ingredients: Ingredient[];
	createRecipes: (recipes: RecipeFormData[]) => Promise<Recipe[]>;
} & Omit<HTMLAttributes<HTMLFormElement>, "action" | "children">) {
	const [persistedDraft, setPersistedDraft] = useLocalStorage<string>(
		DRAFT_STORAGE_KEY,
		"",
		"session",
	);
	const deferredDraftValue = useDeferredValue(persistedDraft);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const editorRef = useRef<LexicalEditor | null>(null);

	const handleTextChange = useCallback(
		(text: string) => {
			setPersistedDraft(text);
		},
		[setPersistedDraft],
	);

	const draftRecipes = useBulkDraftTextToBaseRecipes(
		deferredDraftValue,
		ingredients,
	);

	const newIngredientCount = useMemo(() => {
		const names = new Set<string>();
		for (const recipe of draftRecipes) {
			for (const spec of recipe.specs ?? []) {
				if (!spec.ingredientId && spec.ingredient?.name) {
					names.add(spec.ingredient.name.toLowerCase());
				}
			}
		}
		return names.size;
	}, [draftRecipes]);

	const router = useRouter();
	const onSuccess = useCallback(() => {
		editorRef.current?.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
		router.push("/bar/recipes");
	}, [router]);

	const onError = useCallback(() => {
		setIsSubmitting(false);
		editorRef.current?.setEditable(true);
	}, []);

	const baseFormAction = useCreateBulkDraftRecipes(
		draftRecipes,
		createRecipes,
		{
			onSuccess,
			onError,
			createMoreHref: "/bar/recipes/create/text",
		},
	);

	const formAction = useCallback(() => {
		setIsSubmitting(true);
		editorRef.current?.setEditable(false);
		baseFormAction();
	}, [baseFormAction]);

	const { dialogRef, isOpen, mounted, showModal, closeModal } = useDialog();
	const recipeCount = draftRecipes.length;

	return (
		<form
			{...props}
			className={clsx(className, styles.form)}
			action={formAction}
		>
			<div className={clsx(styles.editor, { [styles.disabled]: isSubmitting })}>
				<RecipeEditor
					editorRef={editorRef}
					ingredients={ingredients}
					initialText={persistedDraft}
					onTextChange={handleTextChange}
					statusBar={
						<div className={styles.actions}>
							<Text as="div" size={0} light numeric>
								<div>
									{recipeCount} new {recipeCount === 1 ? "Recipe" : "Recipes"}
								</div>

								<div>
									{newIngredientCount} new{" "}
									{newIngredientCount === 1 ? "Ingredient" : "Ingredients"}
								</div>
							</Text>

							<div className={styles.primary}>
								<Button
									variant="outline"
									size="small"
									onClick={recipeCount > 0 ? showModal : undefined}
									aria-disabled={recipeCount === 0}
								>
									<Icon name="expand" size={1} />
									Preview
								</Button>

								<SubmitButton
									size="small"
									variant="solid"
									color={recipeCount > 0 ? "accent" : "light"}
									disabled={recipeCount === 0}
									endAdornment={
										<Kbd
											shortcut="mod+enter"
											variant="ghost"
											ignoreInputEvents={false}
										/>
									}
								>
									Create
								</SubmitButton>
							</div>
						</div>
					}
				/>
			</div>

			<PreviewRecipesDialog
				dialogRef={dialogRef}
				isOpen={isOpen}
				mounted={mounted}
				recipes={draftRecipes}
				onClose={closeModal}
			/>
		</form>
	);
}
