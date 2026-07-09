import { type AppErrorPayload, appErrorSchema } from "@bespoke/schema/appError";
import { TRPCClientError } from "@trpc/client";

export function getAppErrorPayload(error: unknown): AppErrorPayload | null {
	if (!(error instanceof TRPCClientError)) return null;
	const parsed = appErrorSchema.safeParse(error.data?.appError);
	return parsed.success ? parsed.data : null;
}

export function isUpdateRequired(
	payload: AppErrorPayload | null,
): payload is Extract<AppErrorPayload, { code: "UPDATE_REQUIRED" }> {
	return payload?.code === "UPDATE_REQUIRED";
}
