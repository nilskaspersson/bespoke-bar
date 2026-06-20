"use server";

import {
	type BulkUpdateTagsInput,
	bulkUpdateTags as bulkUpdateTagsService,
} from "@/features/tags/api/bulkUpdateTags.service";
import { authOrForbidden } from "@/utils/auth";

export async function bulkUpdateTags(input: BulkUpdateTagsInput) {
	const auth = await authOrForbidden();
	return bulkUpdateTagsService(auth, input);
}
