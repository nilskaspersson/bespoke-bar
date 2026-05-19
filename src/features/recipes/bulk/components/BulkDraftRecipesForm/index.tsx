"use client";

import { clsx } from "clsx";
import { CLEAR_EDITOR_COMMAND, type LexicalEditor } from "lexical";
import { useRouter } from "next/navigation";
import {
	type ComponentProps,
	useCallback,
	useDeferredValue,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { BottomRailItems } from "@/components/BottomRail";
import type { RecipeFormData } from "@/db/schema/composite";
import type { Ingredient } from "@/db/schema/ingredients";
import type { Recipe } from "@/db/schema/recipes";
import { RecipeEditor } from "@/features/recipes/bulk/components/RecipeEditor";
import { useCreateBulkDraftRecipes } from "@/features/recipes/bulk/hooks/useCreateBulkDraftRecipes";
import { useBulkDraftTextToBaseRecipes } from "@/features/recipes/bulk/hooks/useFormatBulkDraftRecipes";
import { DraftRecipesPreview } from "@/features/recipes/components/DraftRecipesPreview";
import { useLocalStorage } from "@/hooks/useLocalStorage";
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
} & Omit<ComponentProps<"div">, "children">) {
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

	const recipeCount = draftRecipes.length;
	const formId = useId();

	return (
		<div {...props} className={clsx(className, styles.root)}>
			<form id={formId} className={styles.form} action={formAction}>
				<div
					className={clsx(styles.editor, { [styles.disabled]: isSubmitting })}
				>
					<RecipeEditor
						editorRef={editorRef}
						ingredients={ingredients}
						initialText={persistedDraft}
						onTextChange={handleTextChange}
						statusBar={
							<Text as="div" size={0} light numeric>
								{recipeCount} new {recipeCount === 1 ? "Recipe" : "Recipes"},{" "}
								{newIngredientCount} new{" "}
								{newIngredientCount === 1 ? "Ingredient" : "Ingredients"}
							</Text>
						}
					/>
				</div>
			</form>

			<DraftRecipesPreview recipes={draftRecipes} className={styles.preview} />

			<BottomRailItems>
				<SubmitButton
					form={formId}
					variant="clear"
					rounded
					color={"accent"}
					aria-disabled={recipeCount === 0}
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
			</BottomRailItems>
		</div>
	);
}
