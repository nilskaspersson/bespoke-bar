"use server";

import z from "zod";
import { ACCEPTED_IMAGE_TYPES } from "@/constants";
import { findRecipeInTextWithLLM } from "@/features/recipes/photo/utils/findRecipeInTextWithLLM";
import { authOrForbidden } from "@/utils/auth";
import { parseTextFromImage } from "@/utils/vision";

const fileSchema = z.file();
fileSchema.max(10 * 1024 * 1024); // 10 MB
fileSchema.mime(ACCEPTED_IMAGE_TYPES);

/**
 * TODO: Move to API route with specific body size limit (remove config from
 * next.config.ts).
 */
export async function parseTextFromImageAction(formData: FormData) {
	await authOrForbidden();

	const imageEntries = formData.getAll("image");

	const validFile = imageEntries
		.filter((entry): entry is File => entry instanceof File)
		.find((file) => file.size > 0);

	if (!validFile) {
		throw new Error("No valid image file provided");
	}

	const file = fileSchema.parse(validFile);

	/**
	 * Do OCR with Google Vision API. This will find ALL text in the image.
	 */
	const ocrResult = await parseTextFromImage(file);

	/**
	 * Clean up the OCR output with an LLM. The provided text is returned in case of
	 * failure or timeout.
	 */
	const recipeText = await findRecipeInTextWithLLM(
		ocrResult.fullTextAnnotation?.text,
	);

	if (recipeText === "") {
		throw new Error("No recipe found in image");
	}

	return {
		success: true,
		rawOcrText: ocrResult.fullTextAnnotation?.text,
		extractedText: recipeText,
	};
}
