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
import { BottomRailItems } from "@/components/BottomRail";
import type { Ingredient } from "@/db/schema/ingredients";
import { OCRQuotaIndicator } from "@/features/billing/components/OCRQuotaIndicator";
import { createRecipesWithSpecsFromData } from "@/features/recipes/api/upsertRecipesWithSpecs";
import { useCreateBulkDraftRecipes } from "@/features/recipes/bulk/hooks/useCreateBulkDraftRecipes";
import { useBulkDraftTextToBaseRecipes } from "@/features/recipes/bulk/hooks/useFormatBulkDraftRecipes";
import { OCROutputPreview } from "@/features/recipes/photo/components/OCROutputPreview";
import { UploadPhotoForm } from "@/features/recipes/photo/components/UploadPhotoForm";
import { useImageUploadPreview } from "@/hooks/useImageUploadPreview";
import { trpc } from "@/trpc/client";
import { Button } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { ConfirmAction } from "@/ui/ConfirmAction";
import { Grid } from "@/ui/Grid";
import { ImageUploadPreview } from "@/ui/ImageUploadPreview";
import { Kbd } from "@/ui/Kbd";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function PhotoToRecipe({
	ingredients,
	className,
	...props
}: { ingredients: Ingredient[] } & ComponentProps<"div">) {
	const rootRef = useRef<HTMLDivElement>(null);
	const outputContainerRef = useRef<HTMLDivElement>(null);
	const imagePreviewRef = useRef<HTMLImageElement>(null);

	const [ocrText, setOcrText] = useState("");
	const [draftRecipeText, setDraftRecipeText] = useState("");
	const deferredDraftRecipeText = useDeferredValue(draftRecipeText);

	const [isParsing, setIsParsing] = useState(false);

	const { imagePreviewUrl, createImagePreview, clearImagePreview } =
		useImageUploadPreview();

	const { data: ocrQuota } = trpc.billing.ocrQuotaState.useQuery(undefined, {
		refetchOnMount: "always",
	});
	const isAtOCRQuotaCap = ocrQuota?.remaining === 0;

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

	const resetFlow = useCallback(() => {
		clearImagePreview();
		setDraftRecipeText("");
		setOcrText("");

		rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	}, [clearImagePreview]);

	const submitBulkRecipesAction = useCreateBulkDraftRecipes(
		draftRecipes,
		createRecipesWithSpecsFromData,
		{ onSuccess: resetFlow },
	);

	const hasSelectedImage = Boolean(imagePreviewUrl);
	const hasParsedText = Boolean(ocrText);
	const hasDraftRecipes = draftRecipes.length > 0;
	const canReset = (hasSelectedImage || hasParsedText) && !isParsing;

	return (
		<div {...props} ref={rootRef} className={clsx(className, styles.base)}>
			<UploadPhotoForm
				onChange={imageChangeHandler}
				onSuccess={onSubmitPhotoSuccess}
				onParsingChange={setIsParsing}
				className={clsx(styles.step, styles.stepUpload, {
					[styles.hasImagePreview]: hasSelectedImage,
				})}
				usageInfo={<OCRQuotaIndicator locked={isAtOCRQuotaCap} />}
				disabled={isAtOCRQuotaCap || hasSelectedImage}
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

			<Grid gap={2}>
				<OCROutputPreview
					ref={outputContainerRef}
					draftRecipes={draftRecipes}
					disabled={!hasParsedText}
					ingredients={ingredients}
					ocrText={ocrText}
					onChangeDraftRecipesText={setDraftRecipeText}
					className={clsx(styles.step, styles.stepOutput, {
						[styles.hasParsedText]: hasParsedText,
						[styles.hasDraftRecipes]: hasDraftRecipes,
					})}
				/>

				<Callout size={1} icon="circle-exclamation" variant="inset">
					Text extraction can be inaccurate. Double-check extracted recipes.
				</Callout>
			</Grid>

			<BottomRailItems>
				{canReset ? (
					<ConfirmAction
						action={async () => {
							resetFlow();
						}}
						actionLabel="Clear form"
						buttonProps={{
							variant: "clear",
							color: "amber",
							rounded: true,
							size: "default",
						}}
						notice="Extracting the image again will count as another daily use."
						description={
							<Text as="p" heavy>
								This clears the selected image and any Recipes extracted from
								it.
							</Text>
						}
					>
						Reset
					</ConfirmAction>
				) : null}

				<Button
					variant="clear"
					rounded
					color="accent"
					aria-disabled={!hasDraftRecipes}
					onClick={hasDraftRecipes ? submitBulkRecipesAction : undefined}
					endAdornment={
						<Kbd
							shortcut="mod+enter"
							variant="ghost"
							ignoreInputEvents={false}
						/>
					}
				>
					{hasDraftRecipes
						? `Create ${draftRecipes.length} ${draftRecipes.length > 1 ? "recipes" : "recipe"}`
						: "Create"}
				</Button>
			</BottomRailItems>
		</div>
	);
}
