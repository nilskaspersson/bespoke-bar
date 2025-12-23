"use server";

import { VertexAI } from "@google-cloud/vertexai";
import { getGCPCredentials } from "@/utils/gcp";

const vertexAI = new VertexAI({
	project: process.env.GCP_PROJECT_ID,
	googleAuthOptions: getGCPCredentials(),
});

const generativeModel = vertexAI.getGenerativeModel(
	{ model: "gemini-2.5-flash-lite" },
	{ timeout: 5000 },
);

const NO_RECIPES_FOUND = "NO_RECIPES_FOUND";

export async function findRecipeInTextWithLLM(
	userText: string | null | undefined,
): Promise<string> {
	if (!userText) {
		return "";
	}

	try {
		const prompt = `You are analyzing text detected from a photo that may contain cocktail recipes.

Extract ONLY text that appears to be cocktail recipes. If multiple recipes exist, separate them with two newlines.

Include: recipe names (only if followed by ingredients) and ingredient lists with measurements
Exclude: watermarks, logos, decorative text, unrelated notes, background text

Expected output format:
Gimlet
5 cl Gin
3 cl Lime juice
2 cl Simple syrup

<detected_text>
${userText}
</detected_text>

IMPORTANT: If the detected text contains NO recipe content, return exactly: ${NO_RECIPES_FOUND}

Return ONLY the filtered recipe text or ${NO_RECIPES_FOUND}. No commentary, no markdown, no explanations.`;

		const result = await generativeModel.generateContent({
			contents: [{ role: "user", parts: [{ text: prompt }] }],
		});

		const response = result.response;
		const textPart = response.candidates?.[0]?.content?.parts?.find((part) =>
			Boolean(part.text),
		);

		if (textPart?.text?.trim() === NO_RECIPES_FOUND) {
			return "";
		}

		return textPart?.text ?? "";
	} catch (error) {
		console.warn("LLM filtering failed, using raw OCR:", error);
		return userText;
	}
}
