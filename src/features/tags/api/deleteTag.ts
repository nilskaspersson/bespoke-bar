"use server";

import type { Tag } from "@/db/schema/tags";
import { deleteTag as deleteTagService } from "@/features/tags/api/deleteTag.service";
import { authOrForbidden } from "@/utils/auth";

export async function deleteTag(id: Tag["id"]) {
	const auth = await authOrForbidden();
	return deleteTagService(auth, id);
}
