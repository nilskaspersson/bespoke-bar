"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { OCR_CONSENT_VERSION } from "@/features/consent/constants";
import { rateLimit } from "@/rateLimit";
import { authOrForbidden } from "@/utils/auth";
import { catchKnownErrors } from "@/utils/serverAction";

const OCR_CONSENT_KEY = "ocrConsentVersion";
const OCR_CONSENT_DATE_KEY = "ocrConsentDate";

export async function checkOCRConsent(): Promise<boolean> {
	const user = await currentUser();

	if (!user) return false;

	return user.publicMetadata[OCR_CONSENT_KEY] === OCR_CONSENT_VERSION;
}

export async function storeOCRConsent() {
	return catchKnownErrors(async () => {
		const { userId } = await authOrForbidden();

		await rateLimit(userId);

		const client = await clerkClient();

		await client.users.updateUserMetadata(userId, {
			publicMetadata: {
				[OCR_CONSENT_KEY]: OCR_CONSENT_VERSION,
				[OCR_CONSENT_DATE_KEY]: new Date().toISOString(),
			},
		});
	});
}
