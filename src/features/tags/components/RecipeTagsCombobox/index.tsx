"use client";

import { clsx } from "clsx";
import { type ComponentProps, useMemo } from "react";
import type { Tag } from "@/db/schema/tags";
import {
	MAX_TAGS_PER_RECIPE,
	TAG_NAME_MAX_LENGTH,
} from "@/features/tags/constants";
import { useRecipeTagsCombobox } from "@/features/tags/hooks/useRecipeTagsCombobox";
import { usePlatform } from "@/stores/platform";
import { Button } from "@/ui/Button";
import { Chip } from "@/ui/Chip";
import { Flex } from "@/ui/Flex";
import { Icon } from "@/ui/Icon";
import { Input } from "@/ui/Input";
import { Kbd } from "@/ui/Kbd";
import { Lightbox } from "@/ui/Lightbox";
import { Popover } from "@/ui/Popover";
import { Spinner } from "@/ui/Spinner";
import { Text } from "@/ui/Text";
import { collator } from "@/utils/collator";
import { handleKey, matchesShortcut } from "@/utils/keyboard";
import {
	createSearchIndex,
	findExactByIndex,
	searchByIndex,
} from "@/utils/search";
import styles from "./styles.module.css";

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

	const {
		search,
		setSearch,
		deferredSearch,
		draftedIds,
		overLimit,
		isOverMax,
		isCreating,
		handleSuggestionClick,
		handleCreate,
		handleClearAll,
		handleCancel,
		handleApply,
		handleToggle,
		handlePopoverKeyDown,
	} = useRecipeTagsCombobox({
		popoverContentProps,
		onClosePopover,
		assignedTagIds,
		onCreateTag,
		onCommit,
	});

	const searchIndex = useMemo(
		() => createSearchIndex(tagOptions, getTagKey, getTagSearchFields),
		[tagOptions],
	);

	const suggestions = useMemo(
		() => searchByIndex(tagOptions, searchIndex, getTagKey, deferredSearch),
		[tagOptions, searchIndex, deferredSearch],
	);

	const draftSet = useMemo(() => new Set(draftedIds), [draftedIds]);

	const matchedTag = useMemo(
		() => findExactByIndex(tagOptions, searchIndex, getTagKey, deferredSearch),
		[tagOptions, searchIndex, deferredSearch],
	);

	const showCreate = deferredSearch.length > 0 && !matchedTag;
	const enterTarget =
		matchedTag?.name ?? deferredSearch.slice(0, TAG_NAME_MAX_LENGTH);

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
			onKeyDown={handlePopoverKeyDown}
			onToggle={handleToggle}
			position="bottom-start"
			className={styles.popover}
		>
			<Lightbox className={styles.surface}>
				<Input
					autoFocus
					type="search"
					name="tag-search"
					aria-label="Search or create tag"
					placeholder="Search or create…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					onKeyDown={handleInputKeyDown}
					autoComplete="off"
					spellCheck={false}
					aria-disabled={isCreating}
					compact
					fullWidth
				/>

				<Flex gap={4} justifyContent="space-between" alignItems="center">
					<Text
						size={1}
						light={!isOverMax}
						truncate
						aria-live="polite"
						className={clsx({
							[styles.hidden]: !deferredSearch,
							[styles.invalid]: isOverMax,
						})}
					>
						{isOverMax ? (
							`Tag name must be ${TAG_NAME_MAX_LENGTH} characters or fewer`
						) : (
							<>
								<Kbd shortcut="enter" visual /> to{" "}
								{matchedTag ? "toggle" : "create"} “{enterTarget}”
							</>
						)}
					</Text>

					<Text size={0} light numeric className={styles.counter}>
						<span
							className={clsx({
								[styles.invalid]: isOverMax,
							})}
						>
							{deferredSearch.length}
						</span>
						/{TAG_NAME_MAX_LENGTH}
					</Text>
				</Flex>

				{suggestions.length > 0 || showCreate ? (
					<div className={styles.suggestions}>
						<Flex as="ul" wrap gap={1} className={styles.suggestionsList}>
							{suggestions
								.toSorted((a, b) => collator.compare(a.name, b.name))
								.map((tag) => {
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
										aria-disabled={isOverMax || isCreating}
										aria-busy={isCreating}
										className={styles.tag}
									>
										{isCreating ? (
											<Spinner size={0} />
										) : (
											<Icon name="plus" size={0} />
										)}
										{isCreating ? "Creating…" : `New tag “${enterTarget}”`}
									</Chip>
								</li>
							) : null}
						</Flex>

						<Text
							size={0}
							light
							numeric
							className={clsx(styles.available, {
								[styles.invalid]: draftedIds.length >= MAX_TAGS_PER_RECIPE,
							})}
						>
							Recipe tags: {draftedIds.length}/{MAX_TAGS_PER_RECIPE}
						</Text>
					</div>
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
							disabled={overLimit}
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
