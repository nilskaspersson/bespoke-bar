import z from "zod";
import { ACCEPTED_IMAGE_TYPES } from "@/constants";
import { parseTextFromImage } from "@/features/recipes/photo/api/vision";
import { findRecipeInTextWithLLM } from "@/features/recipes/photo/utils/findRecipeInTextWithLLM";

const fileSchema = z.file();
fileSchema.max(10 * 1024 * 1024); // 10 MB
fileSchema.mime(ACCEPTED_IMAGE_TYPES);

export async function parseTextFromImageService(formData: FormData) {
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
