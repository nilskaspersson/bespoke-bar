import { ImageAnnotatorClient } from "@google-cloud/vision";
import { getGCPCredentials } from "@/utils/gcp";

// EU multi-region so the uploaded image is processed in the EU; Vision has no
// single-region (Frankfurt) endpoint. Override with GCP_VISION_ENDPOINT.
const visionClient = new ImageAnnotatorClient({
	...getGCPCredentials(),
	apiEndpoint: process.env.GCP_VISION_ENDPOINT ?? "eu-vision.googleapis.com",
});

export async function parseTextFromImage(image: File) {
	const arrayBuffer = await image.arrayBuffer();

	const [result] = await visionClient.documentTextDetection({
		image: { content: Buffer.from(arrayBuffer) },
	});

	return result;
}
