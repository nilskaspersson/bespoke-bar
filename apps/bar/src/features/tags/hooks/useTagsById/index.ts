import { useMemo } from "react";
import type { Tag } from "@/db/schema/tags";

export function useTagsById(tags: Tag[]): Map<string, Tag> {
	return useMemo(() => new Map(tags.map((tag) => [tag.id, tag])), [tags]);
}
