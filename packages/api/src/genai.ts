import { GoogleGenAI } from "@google/genai";
import { getGCPCredentials } from "./gcp";

/**
 * Shared Vertex AI client for every Gemini call. Defaults to "europe-west1"
 * (Belgium) since it hosts flash-lite.
 */
export const genAI = new GoogleGenAI({
	vertexai: true,
	project: process.env.GCP_PROJECT_ID,
	location: process.env.GCP_VERTEX_LOCATION ?? "europe-west1",
	googleAuthOptions: getGCPCredentials(),
});
