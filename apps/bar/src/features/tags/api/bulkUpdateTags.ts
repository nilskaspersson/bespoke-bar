"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import {
	type BulkUpdateTagsInput,
	bulkUpdateTags as bulkUpdateTagsService,
} from "@bespoke/api/tags/bulkUpdateTags.service";

export async function bulkUpdateTags(input: BulkUpdateTagsInput) {
	const auth = await authOrForbidden();
	return bulkUpdateTagsService(auth, input);
}
