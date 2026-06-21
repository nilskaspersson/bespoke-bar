import {
	type AppErrorPayload,
	getAppErrorMessage,
} from "@bespoke/schema/appError";

export class AppError extends Error {
	constructor(public payload: AppErrorPayload) {
		super(getAppErrorMessage(payload));
		this.name = "AppError";
	}
}
