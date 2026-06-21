"use server";

import type { InsertTag } from "@bespoke/schema/schema/tags";
import { createTag as createTagService } from "@/features/tags/api/createTag.service";
import { authOrForbidden } from "@/utils/auth";

export async function createTag(input: InsertTag) {
	const auth = await authOrForbidden();
	return createTagService(auth, input);
}
