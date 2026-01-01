"use client";

import { clsx } from "clsx";
import {
	type ChangeEventHandler,
	type ComponentProps,
	useCallback,
	useDeferredValue,
	useRef,
	useState,
} from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { useBulkDraftTextToBaseRecipes } from "@/features/recipes/hooks/useFormatBulkDraftRecipes";
import { OutputPreview } from "@/features/recipes/photo/components/OutputPreview";
import { UploadPhotoForm } from "@/features/recipes/photo/components/UploadPhotoForm";
import { useImageUploadPreview } from "@/hooks/useImageUploadPreview";
import { ImageUploadPreview } from "@/ui/ImageUploadPreview";
import styles from "./styles.module.css";

export function PhotoToRecipe({
	ingredients,
	className,
	...props
}: { ingredients: Ingredient[] } & ComponentProps<"div">) {
	const outputContainerRef = useRef<HTMLDivElement>(null);
	const imagePreviewRef = useRef<HTMLImageElement>(null);

	const [ocrText, setOcrText] = useState("");
	const [draftRecipeText, setDraftRecipeText] = useState("");
	const deferredDraftRecipeText = useDeferredValue(draftRecipeText);

	const { imagePreviewUrl, createImagePreview } = useImageUploadPreview();

	const draftRecipes = useBulkDraftTextToBaseRecipes(
		deferredDraftRecipeText,
		ingredients,
	);

	const onSubmitPhotoSuccess = useCallback((extractedText: string) => {
		setDraftRecipeText(extractedText);
		setOcrText(extractedText);

		outputContainerRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "center",
		});
	}, []);

	const imageChangeHandler: ChangeEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			const file = Array.from(event.target.files || []).find((o) => o.size > 0);

			if (!file) return;

			createImagePreview(file);
			setDraftRecipeText("");
			setOcrText("");

			imagePreviewRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		},
		[createImagePreview],
	);

	const hasSelectedImage = Boolean(imagePreviewUrl);
	const hasParsedText = Boolean(ocrText);
	const hasDraftRecipes = draftRecipes.length > 0;

	return (
		<div {...props} className={clsx(className, styles.base)}>
			<UploadPhotoForm
				onChange={imageChangeHandler}
				onSuccess={onSubmitPhotoSuccess}
				className={clsx(styles.step, styles.stepUpload, {
					[styles.hasImagePreview]: hasSelectedImage,
				})}
			/>

			<hr
				className={clsx(styles.divider, {
					[styles.solid]: hasSelectedImage,
				})}
			/>

			<ImageUploadPreview
				ref={imagePreviewRef}
				src={imagePreviewUrl}
				alt="Your image"
				className={clsx(styles.step, styles.stepPreview, {
					[styles.hasParsedText]: hasParsedText,
					[styles.hasImagePreview]: hasSelectedImage,
				})}
			/>

			<hr
				className={clsx(styles.divider, {
					[styles.solid]: hasParsedText,
				})}
			/>

			<OutputPreview
				ref={outputContainerRef}
				draftRecipes={draftRecipes}
				disabled={!hasParsedText}
				draftRecipesText={draftRecipeText}
				onChangeDraftRecipesText={(e) => setDraftRecipeText(e.target.value)}
				className={clsx(styles.step, styles.stepOutput, {
					[styles.hasParsedText]: hasParsedText,
					[styles.hasDraftRecipes]: hasDraftRecipes,
				})}
			/>
		</div>
	);
}
