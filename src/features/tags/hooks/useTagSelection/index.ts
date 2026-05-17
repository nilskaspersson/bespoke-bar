import { useCallback, useState } from "react";

export function useTagSelection(initial: string[] = []) {
	const [selectedTagIds, setSelectedTagIds] = useState(initial);

	const toggleTagId = useCallback((tagId: string) => {
		setSelectedTagIds((prev) =>
			prev.includes(tagId)
				? prev.filter((id) => id !== tagId)
				: [...prev, tagId],
		);
	}, []);

	const clearTagIds = useCallback(() => setSelectedTagIds([]), []);

	return {
		selectedTagIds,
		setSelectedTagIds,
		toggleTagId,
		clearTagIds,
	};
}
