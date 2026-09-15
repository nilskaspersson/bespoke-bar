"use client";

import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { BottomRailItems } from "@bespoke/ui/BottomRail";
import { Button } from "@bespoke/ui/Button";
import { Callout } from "@bespoke/ui/Callout";
import { ConfirmAction } from "@bespoke/ui/ConfirmAction";
import { Grid } from "@bespoke/ui/Grid";
import { useLocalStorage } from "@bespoke/ui/hooks/useLocalStorage";
import { Icon } from "@bespoke/ui/Icon";
import { ImageUploadPreview } from "@bespoke/ui/ImageUploadPreview";
import { Kbd } from "@bespoke/ui/Kbd";
import { Text } from "@bespoke/ui/Text";
import { clsx } from "clsx";
import {
	type ChangeEventHandler,
	type ComponentProps,
	useCallback,
	useDeferredValue,
	useRef,
	useState,
} from "react";
import { OCRQuotaIndicator } from "@/features/billing/components/OCRQuotaIndicator";
import { createRecipesWithLinesFromData } from "@/features/recipes/api/upsertRecipesWithLines";
import { useCreateBulkDraftRecipes } from "@/features/recipes/bulk/hooks/useCreateBulkDraftRecipes";
import { useBulkDraftTextToBaseRecipes } from "@/features/recipes/bulk/hooks/useFormatBulkDraftRecipes";
import { HandoffDialogLoader } from "@/features/recipes/photo/components/HandoffDialog/loader";
import { OCROutputPreview } from "@/features/recipes/photo/components/OCROutputPreview";
import { UploadPhotoForm } from "@/features/recipes/photo/components/UploadPhotoForm";
import { useImageUploadPreview } from "@/hooks/useImageUploadPreview";
import { trpc } from "@/trpc/client";
import styles from "./styles.module.css";

const DRAFT_STORAGE_KEY = "recipe-photo-draft";

type PhotoDraft = { ocrText: string; draftText: string; source?: "phone" };

const EMPTY_DRAFT: PhotoDraft = { ocrText: "", draftText: "" };

export function PhotoToRecipe({
	ingredients,
	className,
	...props
}: { ingredients: Ingredient[] } & ComponentProps<"div">) {
	const rootRef = useRef<HTMLDivElement>(null);
	const outputContainerRef = useRef<HTMLDivElement>(null);
	const imagePreviewRef = useRef<HTMLImageElement>(null);

	const [draft, setDraft] = useLocalStorage<PhotoDraft>(
		DRAFT_STORAGE_KEY,
		EMPTY_DRAFT,
		"session",
	);
	const { ocrText, draftText } = draft;
	const deferredDraftText = useDeferredValue(draftText);

	const [isParsing, setIsParsing] = useState(false);

	const { imagePreviewUrl, createImagePreview, clearImagePreview } =
		useImageUploadPreview();

	const { data: ocrQuota } = trpc.billing.ocrQuotaState.useQuery(undefined, {
		refetchOnMount: "always",
	});
	const isAtOCRQuotaCap = ocrQuota?.remaining === 0;

	const draftRecipes = useBulkDraftTextToBaseRecipes(
		deferredDraftText,
		ingredients,
	);

	const onSubmitPhotoSuccess = useCallback(
		(extractedText: string) => {
			setDraft({ ocrText: extractedText, draftText: extractedText });

			outputContainerRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		},
		[setDraft],
	);

	const onHandoffResult = useCallback(
		(extractedText: string) => {
			clearImagePreview();
			setDraft({
				ocrText: extractedText,
				draftText: extractedText,
				source: "phone",
			});

			outputContainerRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		},
		[clearImagePreview, setDraft],
	);

	const [isHandoffOpen, setIsHandoffOpen] = useState(false);
	const openHandoff = useCallback(() => setIsHandoffOpen(true), []);
	const closeHandoff = useCallback(() => setIsHandoffOpen(false), []);

	const handleDraftTextChange = useCallback(
		(text: string) => {
			setDraft((prev) => ({ ...prev, draftText: text }));
		},
		[setDraft],
	);

	const imageChangeHandler: ChangeEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			const file = Array.from(event.target.files || []).find((o) => o.size > 0);

			if (!file) return;

			createImagePreview(file);
			setDraft(EMPTY_DRAFT);

			imagePreviewRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		},
		[createImagePreview, setDraft],
	);

	const resetFlow = useCallback(() => {
		clearImagePreview();
		setDraft(EMPTY_DRAFT);

		rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	}, [clearImagePreview, setDraft]);

	const submitBulkRecipesAction = useCreateBulkDraftRecipes(
		draftRecipes,
		createRecipesWithLinesFromData,
		{ onSuccess: resetFlow },
	);

	const isFromPhone = draft.source === "phone";
	const hasSelectedImage = Boolean(imagePreviewUrl) || isFromPhone;
	const hasParsedText = Boolean(ocrText);
	const hasDraftRecipes = draftRecipes.length > 0;
	const canReset = (hasSelectedImage || hasParsedText) && !isParsing;

	return (
		<div {...props} ref={rootRef} className={clsx(className, styles.base)}>
			<UploadPhotoForm
				onChange={imageChangeHandler}
				onSuccess={onSubmitPhotoSuccess}
				onParsingChange={setIsParsing}
				onHandoff={openHandoff}
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
				placeholder={
					isFromPhone ? (
						<Grid gap={1} justifyItems="center" className={styles.phone}>
							<Icon name="mobile" size={6} />
							<Text size={1} align="center" heavy>
								Taken on your phone
							</Text>
						</Grid>
					) : undefined
				}
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
					draftText={draftText}
					onChangeDraftRecipesText={handleDraftTextChange}
					className={clsx(styles.step, styles.stepOutput, {
						[styles.hasParsedText]: hasParsedText,
						[styles.hasDraftRecipes]: hasDraftRecipes,
					})}
				/>

				<Callout size={1} icon="circle-exclamation" variant="inset">
					Text extraction can be inaccurate. Double-check extracted recipes.
				</Callout>
			</Grid>

			{isHandoffOpen ? (
				<HandoffDialogLoader
					onResult={onHandoffResult}
					onClose={closeHandoff}
				/>
			) : null}

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
						notice="Extracting an image again will count as another use this month."
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
