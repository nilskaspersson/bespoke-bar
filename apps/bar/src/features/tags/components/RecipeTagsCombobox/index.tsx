"use client";

import {
	MAX_TAGS_PER_RECIPE,
	TAG_NAME_MAX_LENGTH,
} from "@bespoke/domain/tags/constants";
import { collator } from "@bespoke/domain/utils/collator";
import type { Tag } from "@bespoke/schema/schema/tags";
import { Button } from "@bespoke/ui/Button";
import { Chip } from "@bespoke/ui/Chip";
import { Flex } from "@bespoke/ui/Flex";
import { Icon } from "@bespoke/ui/Icon";
import { Input } from "@bespoke/ui/Input";
import { Kbd } from "@bespoke/ui/Kbd";
import { Lightbox } from "@bespoke/ui/Lightbox";
import { Popover } from "@bespoke/ui/Popover";
import { Spinner } from "@bespoke/ui/Spinner";
import { usePlatform } from "@bespoke/ui/stores/platform";
import { Text } from "@bespoke/ui/Text";
import { handleKey, matchesShortcut } from "@bespoke/ui/utils/keyboard";
import { clsx } from "clsx";
import { type ComponentProps, useMemo } from "react";
import { RecipeTag } from "@/features/tags/components/RecipeTag";
import { useRecipeTagsCombobox } from "@/features/tags/hooks/useRecipeTagsCombobox";
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
	onCreateTag?: (name: string) => Promise<Tag>;
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

	const canCreate = !!onCreateTag;
	const showCreate = canCreate && deferredSearch.length > 0 && !matchedTag;
	const enterTarget =
		matchedTag?.name ?? deferredSearch.slice(0, TAG_NAME_MAX_LENGTH);
	const showEnterHint =
		!!matchedTag || (canCreate && deferredSearch.length > 0);

	const handleInputKeyDown = handleKey<HTMLInputElement>([
		[
			"Enter",
			() => {
				if (isOverMax) return;
				if (matchedTag) {
					handleSuggestionClick(matchedTag.id);
					setSearch("");
				} else if (deferredSearch && canCreate) {
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
							[styles.hidden]:
								!deferredSearch || (!isOverMax && !showEnterHint),
							[styles.invalid]: isOverMax,
						})}
					>
						{isOverMax ? (
							`Tag name must be ${TAG_NAME_MAX_LENGTH} characters or fewer`
						) : showEnterHint ? (
							<>
								<Kbd shortcut="enter" visual /> to{" "}
								{matchedTag ? "toggle" : "create"} “{enterTarget}”
							</>
						) : null}
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
								.map((tag) => (
									<li key={tag.id}>
										<RecipeTag
											tag={tag}
											selected={draftSet.has(tag.id)}
											onClick={() => handleSuggestionClick(tag.id)}
										/>
									</li>
								))}

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
