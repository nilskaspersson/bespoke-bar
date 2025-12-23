"use server";

import z from "zod";
import { ACCEPTED_IMAGE_TYPES } from "@/features/recipes/constants";
import { authOrForbidden } from "@/utils/auth";
import { findRecipeInTextWithLLM } from "@/utils/llm";
import { parseTextFromImage } from "@/utils/vision";

const fileSchema = z.file();
fileSchema.max(10 * 1024 * 1024); // 10 MB
fileSchema.mime(ACCEPTED_IMAGE_TYPES);

/**
 * TODO: Move to API route with specific body size limit (remove config from
 * next.config.ts).
 */
export async function parseTextFromImageAction(formData: FormData) {
	const file = fileSchema.parse(formData.get("image"));

	await authOrForbidden();

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
		text: recipeText,
	};
}
