"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { revalidatePath } from "next/cache";
import type { UpdateOrganisationFormData } from "@/db/schema/organisations";
import { updateOrganisationFormSchema } from "@/db/schema/organisations";
import { updateLocalOrganisation as updateLocalOrganisationService } from "@/features/organisation/api/updateLocalOrganisation.service";
import { authOrForbidden } from "@/utils/auth";

export async function updateLocalOrganisation(
	userInput: UpdateOrganisationFormData,
) {
	const auth = await authOrForbidden();
	return updateLocalOrganisationService(auth, userInput);
}

export async function updateLocalOrganisationAction(formData: FormData) {
	const submission = parseWithZod(formData, {
		schema: updateOrganisationFormSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	try {
		await updateLocalOrganisation(submission.value);
	} catch (_error) {
		console.error(_error);

		return submission.reply({
			formErrors: ["Failed to update organisation"],
		});
	}

	revalidatePath("/bar", "layout");

	return submission.reply({
		resetForm: false,
	});
}
