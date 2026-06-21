import type { Tag } from "@bespoke/schema/schema/tags";
import { useMemo } from "react";

export function useTagsById(tags: Tag[]): Map<string, Tag> {
	return useMemo(() => new Map(tags.map((tag) => [tag.id, tag])), [tags]);
}
