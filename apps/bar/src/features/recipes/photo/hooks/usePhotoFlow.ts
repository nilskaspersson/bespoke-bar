"use client";

import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { useDialog } from "@bespoke/ui/hooks/useDialog";
import { useLocalStorage } from "@bespoke/ui/hooks/useLocalStorage";
import {
	type ChangeEventHandler,
	useCallback,
	useDeferredValue,
	useEffect,
	useRef,
	useState,
} from "react";
import { createRecipesWithLinesFromData } from "@/features/recipes/api/upsertRecipesWithLines";
import { useCreateBulkDraftRecipes } from "@/features/recipes/bulk/hooks/useCreateBulkDraftRecipes";
import { useBulkDraftTextToBaseRecipes } from "@/features/recipes/bulk/hooks/useFormatBulkDraftRecipes";
import { useHandoffLink } from "@/features/recipes/photo/hooks/useHandoffLink";
import { useImageUploadPreview } from "@/hooks/useImageUploadPreview";
import { trpc } from "@/trpc/client";

const DRAFT_STORAGE_KEY = "recipe-photo-draft";

type PhotoDraft = { ocrText: string; draftText: string; source?: "phone" };

const EMPTY_DRAFT: PhotoDraft = { ocrText: "", draftText: "" };

export type PhotoFlow = ReturnType<typeof usePhotoFlow>;

export function usePhotoFlow(ingredients: Ingredient[]) {
	const rootRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLDivElement>(null);

	const [draft, setDraft] = useLocalStorage<PhotoDraft>(
		DRAFT_STORAGE_KEY,
		EMPTY_DRAFT,
		"session",
	);
	const { ocrText, draftText } = draft;
	const deferredDraftText = useDeferredValue(draftText);

	/**
	 * A stored draft whose text was cleared comes back as the extracted text on
	 * load. Only on load: clearing the editor mid-session has to stay cleared.
	 */
	const hasRestoredDraft = useRef(false);

	useEffect(() => {
		if (hasRestoredDraft.current || !ocrText) return;

		hasRestoredDraft.current = true;

		if (!draftText) {
			setDraft((prev) => ({ ...prev, draftText: prev.ocrText }));
		}
	}, [ocrText, draftText, setDraft]);

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
	const foundRecipeCount = useBulkDraftTextToBaseRecipes(
		ocrText,
		ingredients,
	).length;

	const onSubmitPhotoSuccess = useCallback(
		(extractedText: string) => {
			setDraft({ ocrText: extractedText, draftText: extractedText });

			rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
		},
		[setDraft],
	);

	const handoffDialog = useDialog();
	const handoff = useHandoffLink({ onMintFailed: handoffDialog.closeModal });

	function openHandoff() {
		handoffDialog.showModal();
		handoff.open();
	}

	const onHandoffResult = useCallback(
		(extractedText: string) => {
			handoff.settle();
			handoffDialog.closeModal();
			clearImagePreview();
			setDraft({
				ocrText: extractedText,
				draftText: extractedText,
				source: "phone",
			});

			rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
		},
		[handoff.settle, handoffDialog.closeModal, clearImagePreview, setDraft],
	);

	const onDraftTextChange = useCallback(
		(text: string) => {
			setDraft((prev) => ({ ...prev, draftText: text }));
		},
		[setDraft],
	);

	const onImageChange: ChangeEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			const file = Array.from(event.target.files || []).find((o) => o.size > 0);

			if (!file) return;

			createImagePreview(file);
			setDraft(EMPTY_DRAFT);

			imageRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		},
		[createImagePreview, setDraft],
	);

	const reset = useCallback(() => {
		clearImagePreview();
		setDraft(EMPTY_DRAFT);

		rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	}, [clearImagePreview, setDraft]);

	const submit = useCreateBulkDraftRecipes(
		draftRecipes,
		createRecipesWithLinesFromData,
		{ onSuccess: reset },
	);

	const isFromPhone = draft.source === "phone";
	const hasSelectedImage = Boolean(imagePreviewUrl) || isFromPhone;
	const hasParsedText = Boolean(ocrText);

	return {
		rootRef,
		imageRef,
		ocrText,
		draftText,
		draftRecipes,
		foundRecipeCount,
		imagePreviewUrl,
		isParsing,
		isAtOCRQuotaCap,
		isFromPhone,
		hasSelectedImage,
		hasParsedText,
		hasDraftRecipes: draftRecipes.length > 0,
		canReset: (hasSelectedImage || hasParsedText) && !isParsing,
		handoffDialog,
		handoff,
		openHandoff,
		onHandoffResult,
		onSubmitPhotoSuccess,
		onParsingChange: setIsParsing,
		onDraftTextChange,
		onImageChange,
		reset,
		submit,
	};
}
