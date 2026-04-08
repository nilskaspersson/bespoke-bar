"use server";

import { parseTextFromImageService } from "@/features/recipes/photo/api/parseTextFromImage.service";
import { authOrForbidden } from "@/utils/auth";

export async function parseTextFromImageAction(formData: FormData) {
	await authOrForbidden();
	return parseTextFromImageService(formData);
}
