"use server";

import { ImageAnnotatorClient } from "@google-cloud/vision";
import { getGCPCredentials } from "@/utils/gcp";

const visionClient = new ImageAnnotatorClient(getGCPCredentials());

export async function parseTextFromImage(image: File) {
	const arrayBuffer = await image.arrayBuffer();

	const [result] = await visionClient.documentTextDetection({
		image: { content: Buffer.from(arrayBuffer) },
	});

	return result;
}
