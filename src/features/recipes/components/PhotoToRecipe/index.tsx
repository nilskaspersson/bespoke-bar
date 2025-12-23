"use client";

import { clsx } from "clsx";
import {
	type ChangeEvent,
	type ComponentProps,
	useCallback,
	useDeferredValue,
	useId,
	useRef,
	useState,
} from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { parseTextFromImageAction } from "@/features/recipes/actions/parseTextFromImage";
import { createRecipesWithSpecsFromData } from "@/features/recipes/actions/upsertRecipeWithSpecs";
import { DraftRecipeCard } from "@/features/recipes/components/DraftRecipeCard";
import { ACCEPTED_IMAGE_TYPES } from "@/features/recipes/constants";
import { useCreateBulkDraftRecipes } from "@/features/recipes/hooks/useCreateBulkDraftRecipes";
import { useBulkDraftTextToBaseRecipes } from "@/features/recipes/hooks/useFormatBulkDraftRecipes";
import { useImageUploadPreview } from "@/hooks/useImageUploadPreview";
import { useServerAction } from "@/hooks/useServerAction";
import { Button } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { FileInput } from "@/ui/FileInput";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { TextArea } from "@/ui/Input";
import { SubmitButton } from "@/ui/SubmitButton";
import { toast } from "@/ui/Toast";
import { errorMessageOrFallback } from "@/utils/api";
import { getKey } from "@/utils/withKey";
import styles from "./styles.module.css";

export function PhotoToRecipe({
	ingredients,
	className,
	...props
}: { ingredients: Ingredient[] } & ComponentProps<"div">) {
	const formId = useId();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [ocrText, setOcrText] = useState("");
	const [draftRecipeText, setDraftRecipeText] = useState("");
	const deferredDraftRecipeText = useDeferredValue(draftRecipeText);

	const { imagePreviewUrl, createImagePreview } = useImageUploadPreview();

	const draftRecipes = useBulkDraftTextToBaseRecipes(
		deferredDraftRecipeText,
		ingredients,
	);

	const { action: parsePhotoTextAction, isPending: isParsingPhotoText } =
		useServerAction(parseTextFromImageAction);

	const submitPhotoAction = useCallback(
		async (formData: FormData) => {
			if (isParsingPhotoText) return;

			const toastId = Date.now().toString();

			try {
				const promise = parsePhotoTextAction(formData);

				toast.promise(promise, {
					id: toastId,
					loading: "Processing image…",
					success: () => ({
						message: "Text extracted",
					}),
					error: (error) => ({
						message: "Error processing image",
						description: errorMessageOrFallback(error, "Try again later."),
					}),
				});

				const parsedFile = await promise;

				if (parsedFile?.success) {
					setDraftRecipeText(parsedFile.text);
					setOcrText(parsedFile.text);
				}
			} catch (_e) {}
		},
		[parsePhotoTextAction, isParsingPhotoText],
	);

	const submitBulkRecipesAction = useCreateBulkDraftRecipes(
		draftRecipes,
		createRecipesWithSpecsFromData,
	);

	const imageChangeHandler = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const files = event.target.files;

			if (files && files.length > 0) {
				createImagePreview(files[0]);

				/**
				 * Automatically submit the form
				 */
				event.target.form?.requestSubmit();
			}
		},
		[createImagePreview],
	);

	return (
		<Grid gap={6} {...props} className={clsx(className, styles.base)}>
			<form action={submitPhotoAction} id={formId}>
				<Grid gap={4} className={styles.upload}>
					<FileInput
						name="image"
						accept={ACCEPTED_IMAGE_TYPES.join(",")}
						required
						disabled={isParsingPhotoText}
						ref={fileInputRef}
						buttonProps={{
							variant: "solid",
							color: "accent",
						}}
						onChange={imageChangeHandler}
					>
						<Icon name="image" /> Upload Recipe photo
					</FileInput>

					<Callout variant="solid" color="regular" icon="circle-info" size={2}>
						For more accurate results, minimize unwanted text from the image.
					</Callout>
				</Grid>
			</form>

			{ocrText ? (
				<Grid as="section" gap={6}>
					<Grid gap={6}>
						<div className={styles.flow}>
							{imagePreviewUrl ? (
								<div className={styles.previewContainer}>
									<img
										src={imagePreviewUrl}
										// biome-ignore lint/a11y/noRedundantAlt: This is literally their image.
										alt="Your image"
										className={styles.preview}
									/>

									<Button
										size="tiny"
										variant="text"
										color="heavy"
										onClick={() => fileInputRef.current?.click()}
										className={styles.changeImage}
									>
										Change image
									</Button>
								</div>
							) : null}

							<Icon name="arrow-right" size={5} className={styles.arrow} />

							<TextArea
								name="draftRecipeText"
								value={draftRecipeText}
								onChange={(e) => setDraftRecipeText(e.target.value)}
								className={styles.draftRecipeText}
								rows={5}
							/>
						</div>

						<ul>
							{draftRecipes.map((recipe) => (
								<li key={getKey(recipe)}>
									<DraftRecipeCard recipe={recipe} convertUnits={null} />
								</li>
							))}
						</ul>
					</Grid>

					<form action={submitBulkRecipesAction}>
						<SubmitButton variant="solid" color="accent">
							{draftRecipes.length > 0 ? (
								<>
									Create {draftRecipes.length}{" "}
									{draftRecipes.length > 1 ? "recipes" : "recipe"}
								</>
							) : (
								"Create"
							)}
						</SubmitButton>
					</form>
				</Grid>
			) : null}
		</Grid>
	);
}
