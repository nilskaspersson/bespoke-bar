"use client";

import type { RecipeFormData } from "@bespoke/schema/schema/composite";
import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import type { Recipe } from "@bespoke/schema/schema/recipes";
import { Button } from "@bespoke/ui/Button";
import { DraftRecipesPreview } from "@bespoke/ui/DraftRecipesPreview";
import { DraftRecipesStatusBar } from "@bespoke/ui/DraftRecipesStatusBar";
import { Kbd } from "@bespoke/ui/Kbd";
import { RecipeEditor } from "@bespoke/ui/RecipeEditor";
import { SubmitButton } from "@bespoke/ui/SubmitButton";
import { clsx } from "clsx";
import { CLEAR_EDITOR_COMMAND, type LexicalEditor } from "lexical";
import { useRouter } from "next/navigation";
import {
	type ComponentProps,
	useCallback,
	useDeferredValue,
	useId,
	useRef,
	useState,
} from "react";
import { BottomRailItems } from "@/components/BottomRail";
import { useCreateBulkDraftRecipes } from "@/features/recipes/bulk/hooks/useCreateBulkDraftRecipes";
import { useBulkDraftTextToBaseRecipes } from "@/features/recipes/bulk/hooks/useFormatBulkDraftRecipes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
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

	const router = useRouter();
	const onSuccess = useCallback(() => {
		editorRef.current?.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
		router.push("/recipes");
	}, [router]);

	const onError = useCallback(() => {
		setIsSubmitting(false);
		editorRef.current?.setEditable(true);
	}, []);

	const clear = useCallback(() => {
		editorRef.current?.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
	}, []);

	const baseFormAction = useCreateBulkDraftRecipes(
		draftRecipes,
		createRecipes,
		{
			onSuccess,
			onError,
			createMoreHref: "/recipes/create/text",
		},
	);

	const formAction = useCallback(() => {
		setIsSubmitting(true);
		editorRef.current?.setEditable(false);
		baseFormAction();
	}, [baseFormAction]);

	const recipeCount = draftRecipes.length;
	const hasContent = deferredDraftValue.trim().length > 0;
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
						statusBar={<DraftRecipesStatusBar recipes={draftRecipes} />}
					/>
				</div>
			</form>

			<DraftRecipesPreview recipes={draftRecipes} className={styles.preview} />

			<BottomRailItems>
				<Button
					type="button"
					variant="clear"
					color="amber"
					rounded
					aria-disabled={!hasContent}
					onClick={hasContent ? clear : undefined}
				>
					Clear
				</Button>

				<SubmitButton
					form={formId}
					variant="clear"
					rounded
					color={"accent"}
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
			</BottomRailItems>
		</div>
	);
}
