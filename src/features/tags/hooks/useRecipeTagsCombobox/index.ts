"use client";

import {
	type ComponentProps,
	type KeyboardEventHandler,
	type ToggleEventHandler,
	useDeferredValue,
	useState,
} from "react";
import type { Tag } from "@/db/schema/tags";
import {
	MAX_TAGS_PER_RECIPE,
	TAG_NAME_MAX_LENGTH,
} from "@/features/tags/constants";
import { usePlatform } from "@/stores/platform";
import type { Popover } from "@/ui/Popover";
import { handleKey, matchesShortcut } from "@/utils/keyboard";

type Args = {
	popoverContentProps: ComponentProps<typeof Popover>;
	onClosePopover: () => void;
	assignedTagIds: string[];
	onCreateTag: (name: string) => Promise<Tag>;
	onCommit: (nextAssignedIds: string[]) => void;
};

export function useRecipeTagsCombobox({
	popoverContentProps,
	onClosePopover,
	assignedTagIds,
	onCreateTag,
	onCommit,
}: Args) {
	const platform = usePlatform((s) => s.platform);
	const [draft, setDraft] = useState<string[] | null>(null);
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search).trim();

	const draftedIds = draft ?? assignedTagIds;
	const overLimit = draftedIds.length > MAX_TAGS_PER_RECIPE;
	const isOverMax = deferredSearch.length > TAG_NAME_MAX_LENGTH;

	const handleSuggestionClick = (tagId: string) => {
		setDraft(
			draftedIds.includes(tagId)
				? draftedIds.filter((id) => id !== tagId)
				: [...draftedIds, tagId],
		);
	};

	const handleCreate = async () => {
		if (!deferredSearch || isOverMax) return;
		try {
			const tag = await onCreateTag(deferredSearch);
			setDraft([...draftedIds, tag.id]);
			setSearch("");
		} catch {
			// onCreateTag toasts on its own
		}
	};

	const handleClearAll = () => {
		setDraft([]);
	};

	const handleCancel = () => {
		setDraft(null);
		setSearch("");
		onClosePopover();
	};

	const handleApply = () => {
		if (overLimit) {
			return;
		}

		if (draft !== null) {
			onCommit(draft);
		}

		handleCancel();
	};

	/**
	 * Light-dismiss / Esc / chip-toggle close paths route through here.
	 * Treated as Cancel — changes only land via the explicit Apply button.
	 */
	const handleToggle: ToggleEventHandler<HTMLDivElement> = (e) => {
		popoverContentProps.onToggle?.(e);

		if (e.target !== e.currentTarget) {
			return;
		}

		if (e.newState === "open") {
			setDraft(assignedTagIds);
		} else if (e.newState === "closed") {
			setDraft(null);
			setSearch("");
		}
	};

	const handleApplyShortcut = handleKey<HTMLDivElement>([
		[
			"Enter",
			handleApply,
			(event) => matchesShortcut(event, "mod+enter", platform),
		],
	]);

	/**
	 * usePopover's contentProps.onKeyDown calls stopPropagation,
	 * which kills the native bubble. Run our handler first so
	 * Cmd+Enter still works regardless of which descendant has focus.
	 */
	const handlePopoverKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
		handleApplyShortcut(e);
		popoverContentProps.onKeyDown?.(e);
	};

	return {
		search,
		setSearch,
		deferredSearch,
		draftedIds,
		overLimit,
		isOverMax,
		handleSuggestionClick,
		handleCreate,
		handleClearAll,
		handleCancel,
		handleApply,
		handleToggle,
		handlePopoverKeyDown,
	};
}
