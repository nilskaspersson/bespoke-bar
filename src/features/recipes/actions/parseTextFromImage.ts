"use server";

import { ImageAnnotatorClient } from "@google-cloud/vision";
import z from "zod";
import { ACCEPTED_IMAGE_TYPES } from "@/features/recipes/constants";
import { getGCPClientCredentials } from "@/gcp";

const client = new ImageAnnotatorClient(getGCPClientCredentials());

const fileSchema = z.file();
fileSchema.max(10 * 1024 * 1024); // 10 MB
fileSchema.mime(ACCEPTED_IMAGE_TYPES);

async function parseTextFromImage(image: File) {
	const arrayBuffer = await image.arrayBuffer();

	const [result] = await client.documentTextDetection({
		image: { content: Buffer.from(arrayBuffer) },
	});

	return result;
}

/**
 * TODO: Move to API route with specific body size limit (remove config from
 * next.config.ts).
 */
export async function parseTextFromImageAction(formData: FormData) {
	const file = fileSchema.parse(formData.get("image"));

	const text = await parseTextFromImage(file);

	return {
		success: true,
		text: text.fullTextAnnotation?.text || "No text detected",
	};
}
