"use server";

import { authOrForbidden } from "@bespoke/api/auth";
import { createTag as createTagService } from "@bespoke/api/tags/createTag.service";
import type { InsertTag } from "@bespoke/schema/schema/tags";

export async function createTag(input: InsertTag) {
	const auth = await authOrForbidden();
	return createTagService(auth, input);
}
