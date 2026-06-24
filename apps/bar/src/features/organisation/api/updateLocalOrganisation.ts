"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { updateLocalOrganisation as updateLocalOrganisationService } from "@bespoke/api/organisation/updateLocalOrganisation.service";
import type { UpdateOrganisationFormData } from "@bespoke/schema/schema/organisations";
import { updateOrganisationFormSchema } from "@bespoke/schema/schema/organisations";
import { parseWithZod } from "@conform-to/zod/v4";

async function updateLocalOrganisation(userInput: UpdateOrganisationFormData) {
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

	return submission.reply({
		resetForm: false,
	});
}
