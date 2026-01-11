"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
	OrganisationsTable,
	type UpdateOrganisationFormData,
	updateOrganisationFormSchema,
	updateOrganisationSchema,
} from "@/db/schema/organisations";
import { authOrForbidden } from "@/utils/auth";

export async function updateLocalOrganisation(
	userInput: UpdateOrganisationFormData,
) {
	const { orgId } = await authOrForbidden();

	const validatedInput = updateOrganisationSchema.parse(userInput);

	const [organisation] = await db
		.update(OrganisationsTable)
		.set({
			...validatedInput,
			updatedAt: sql`NOW()`,
		})
		.where(eq(OrganisationsTable.clerkOrgId, orgId))
		.returning();

	return organisation;
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

	/**
	 * Bust bar-wide cache.
	 */
	revalidatePath("/bar", "layout");

	return submission.reply({
		resetForm: false,
	});
}
