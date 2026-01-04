"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { OCR_CONSENT_VERSION } from "@/features/consent/constants";
import { authOrForbidden } from "@/utils/auth";

const OCR_CONSENT_KEY = "ocrConsentVersion";

export async function checkOCRConsent(): Promise<boolean> {
	const user = await currentUser();

	if (!user) return false;

	return user.publicMetadata[OCR_CONSENT_KEY] === OCR_CONSENT_VERSION;
}

export async function storeOCRConsent(): Promise<void> {
	const { userId } = await authOrForbidden();
	const client = await clerkClient();

	await client.users.updateUserMetadata(userId, {
		publicMetadata: {
			[OCR_CONSENT_KEY]: OCR_CONSENT_VERSION,
		},
	});
}
