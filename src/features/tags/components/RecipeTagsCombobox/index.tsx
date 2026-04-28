"use client";

import { clsx } from "clsx";
import {
	type ComponentProps,
	useDeferredValue,
	useMemo,
	useState,
} from "react";
import { insertTagSchema, type Tag } from "@/db/schema/tags";
import { usePlatform } from "@/stores/platform";
import { Button } from "@/ui/Button";
import { Chip } from "@/ui/Chip";
import { Flex } from "@/ui/Flex";
import { Icon } from "@/ui/Icon";
import { Input } from "@/ui/Input";
import { Kbd } from "@/ui/Kbd";
import { Lightbox } from "@/ui/Lightbox";
import { Popover } from "@/ui/Popover";
import { Text } from "@/ui/Text";
import { handleKey, matchesShortcut } from "@/utils/keyboard";
import {
	createSearchIndex,
	findExactByIndex,
	searchByIndex,
} from "@/utils/search";
import styles from "./styles.module.css";

const NAME_MAX_LENGTH = insertTagSchema.shape.name.maxLength ?? 50;

const getTagKey = (tag: Tag) => tag.id;
const getTagSearchFields = (tag: Tag) => [tag.name];

type Props = {
	popoverContentProps: ComponentProps<typeof Popover>;
	onClosePopover: () => void;
	tagOptions: Tag[];
	assignedTagIds: string[];
	onCreateTag: (name: string) => Promise<Tag>;
	onCommit: (nextAssignedIds: string[]) => void;
};

export function RecipeTagsCombobox({
	popoverContentProps,
	onClosePopover,
	tagOptions,
	assignedTagIds,
	onCreateTag,
	onCommit,
}: Props) {
	const platform = usePlatform((s) => s.platform);
	const [draft, setDraft] = useState<string[] | null>(null);
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search).trim();

	const searchIndex = useMemo(
		() => createSearchIndex(tagOptions, getTagKey, getTagSearchFields),
		[tagOptions],
	);

	const suggestions = useMemo(
		() => searchByIndex(tagOptions, searchIndex, getTagKey, deferredSearch),
		[tagOptions, searchIndex, deferredSearch],
	);

	const draftedIds = draft ?? assignedTagIds;
	const draftSet = useMemo(() => new Set(draftedIds), [draftedIds]);

	const matchedTag = useMemo(
		() => findExactByIndex(tagOptions, searchIndex, getTagKey, deferredSearch),
		[tagOptions, searchIndex, deferredSearch],
	);
	const showCreate = deferredSearch.length > 0 && !matchedTag;
	const enterTarget = (matchedTag?.name ?? deferredSearch).slice(
		0,
		NAME_MAX_LENGTH,
	);
	const isOverMax = deferredSearch.length > NAME_MAX_LENGTH;

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

	const handleApply = () => {
		if (draft !== null) {
			onCommit(draft);
		}
		setDraft(null);
		setSearch("");
		onClosePopover();
	};

	const handleCancel = () => {
		setDraft(null);
		setSearch("");
		onClosePopover();
	};

	/**
	 * Light-dismiss / Esc / chip-toggle close paths route through here.
	 * Treated as Cancel — changes only land via the explicit Apply button.
	 */
	const handleToggle: React.ToggleEventHandler<HTMLDivElement> = (e) => {
		popoverContentProps.onToggle?.(e);
		if (e.target !== e.currentTarget) return;

		if (e.newState === "open") {
			setDraft(assignedTagIds);
		} else if (e.newState === "closed") {
			setDraft(null);
			setSearch("");
		}
	};

	const handlePopoverKeyDown = handleKey<HTMLDivElement>([
		[
			"Enter",
			handleApply,
			(event) => matchesShortcut(event, "mod+enter", platform),
		],
	]);

	const handleInputKeyDown = handleKey<HTMLInputElement>([
		[
			"Enter",
			() => {
				if (isOverMax) return;
				if (matchedTag) {
					handleSuggestionClick(matchedTag.id);
					setSearch("");
				} else if (deferredSearch) {
					handleCreate();
				}
			},
			(event) => !matchesShortcut(event, "mod+enter", platform),
		],
	]);

	return (
		<Popover
			{...popoverContentProps}
			/**
			 * usePopover's contentProps.onKeyDown calls stopPropagation,
			 * which kills the native bubble. Run our handler first so
			 * Cmd+Enter still works regardless of which descendant has focus.
			 */
			onKeyDown={(e) => {
				handlePopoverKeyDown(e);
				popoverContentProps.onKeyDown?.(e);
			}}
			onToggle={handleToggle}
			position="bottom-start"
			className={styles.popover}
		>
			<Lightbox className={styles.surface}>
				<Input
					autoFocus
					type="search"
					placeholder="Search or create…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					onKeyDown={handleInputKeyDown}
					compact
					fullWidth
				/>

				<Flex gap={4} justifyContent="space-between" alignItems="center">
					<Text
						size={1}
						light
						truncate
						compact
						className={clsx({
							[styles.hidden]: !deferredSearch,
						})}
					>
						<Kbd shortcut="enter" visual /> to{" "}
						{matchedTag ? "toggle" : "create"} "{enterTarget}"
					</Text>

					<Text size={0} light numeric className={styles.counter}>
						<span
							className={clsx({
								[styles.invalid]: isOverMax,
							})}
						>
							{deferredSearch.length}
						</span>
						/{NAME_MAX_LENGTH}
					</Text>
				</Flex>

				{suggestions.length > 0 || showCreate ? (
					<Flex as="ul" wrap gap={1} className={styles.suggestions}>
						{suggestions.map((tag) => {
							const isAssigned = draftSet.has(tag.id);

							return (
								<li key={tag.id}>
									<Chip
										as="button"
										type="button"
										onClick={() => handleSuggestionClick(tag.id)}
										variant={isAssigned ? "filled" : "outline"}
										color={isAssigned ? "heavy" : "accent"}
										size={1}
										aria-pressed={isAssigned}
										className={styles.tag}
									>
										<Icon name="tag" size={0} />
										{tag.name}
									</Chip>
								</li>
							);
						})}

						{showCreate ? (
							<li>
								<Chip
									as="button"
									type="button"
									variant="outline"
									color="accent"
									size={1}
									onClick={handleCreate}
									aria-disabled={isOverMax}
									className={styles.tag}
								>
									<Icon name="plus" size={0} />
									New tag "{enterTarget}"
								</Chip>
							</li>
						) : null}
					</Flex>
				) : null}

				<Flex
					justifyContent="space-between"
					alignItems="center"
					gap={2}
					className={styles.actions}
				>
					<Button variant="ghost" size="tiny" onClick={handleCancel}>
						Cancel
					</Button>

					<Flex gap={1}>
						<Button variant="ghost" size="tiny" onClick={handleClearAll}>
							Clear all
						</Button>

						<Button
							variant="solid"
							color="accent"
							size="tiny"
							onClick={handleApply}
							endAdornment={<Kbd shortcut="mod+enter" variant="ghost" visual />}
						>
							Apply
						</Button>
					</Flex>
				</Flex>
			</Lightbox>
		</Popover>
	);
}
