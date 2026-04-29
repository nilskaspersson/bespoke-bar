"use server";

import type { InsertTag, Tag } from "@/db/schema/tags";
import { updateTag as updateTagService } from "@/features/tags/api/updateTag.service";
import { authOrForbidden } from "@/utils/auth";

export async function updateTag(id: Tag["id"], input: InsertTag) {
	const auth = await authOrForbidden();
	return updateTagService(auth, id, input);
}
