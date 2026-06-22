"use client";

import {
	type AppErrorPayload,
	getAppErrorToast,
} from "@bespoke/schema/appError";
import { LinkButton } from "@bespoke/ui/Button";
import { Flex } from "@bespoke/ui/Flex";
import { toast } from "@bespoke/ui/Toast";

type OCRQuotaReachedPayload = Extract<
	AppErrorPayload,
	{ code: "OCR_QUOTA_REACHED" }
>;

export function showOCRQuotaReachedToast(
	payload: OCRQuotaReachedPayload,
	options?: { id?: string | number },
) {
	const { message, description } = getAppErrorToast(payload);

	return toast.error(message, {
		id: options?.id,
		description: (
			<Flex direction="column" gap={2} alignItems="flex-start">
				<span>{description}</span>

				<LinkButton href="/bar/settings#billing" size="tiny" variant="outline">
					Upgrade for more
				</LinkButton>
			</Flex>
		),
	});
}
