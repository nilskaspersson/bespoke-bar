import { AppError } from "@bespoke/schema/appError";
import {
	ACCEPTED_IMAGE_TYPES,
	IMAGE_TOO_LARGE_MESSAGE,
	MAX_IMAGE_BYTES,
} from "@bespoke/schema/constants";
import z from "zod";
import { findRecipeInTextWithLLM } from "./findRecipeInTextWithLLM";
import { parseTextFromImage } from "./vision";

const fileSchema = z
	.file()
	.max(MAX_IMAGE_BYTES, IMAGE_TOO_LARGE_MESSAGE)
	.mime(
		ACCEPTED_IMAGE_TYPES,
		"That file type isn't supported. Use a JPEG, PNG, WebP, or HEIC image.",
	);

export async function parseTextFromImageService(formData: FormData) {
	const imageEntries = formData.getAll("image");

	const validFile = imageEntries
		.filter((entry): entry is File => entry instanceof File)
		.find((file) => file.size > 0);

	if (!validFile) {
		throw new Error("No valid image file provided");
	}

	const parsedFile = fileSchema.safeParse(validFile);
	if (!parsedFile.success) {
		throw new Error(
			parsedFile.error.issues[0]?.message ?? "Invalid image file",
		);
	}
	const file = parsedFile.data;

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

	/**
	 * "Picture of a horse". Vision returned a 2xx but no recipe came out (empty OCR,
	 * or the LLM found none).
	 */
	if (recipeText === "") {
		throw new AppError({ code: "NO_RECIPE_FOUND" });
	}

	return {
		rawOcrText: ocrResult.fullTextAnnotation?.text,
		extractedText: recipeText,
	};
}
