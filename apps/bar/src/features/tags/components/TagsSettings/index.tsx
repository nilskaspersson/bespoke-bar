"use client";

import { TAG_NAME_MAX_LENGTH } from "@bespoke/domain/tags/constants";
import { collator } from "@bespoke/domain/utils/collator";
import type { Tag } from "@bespoke/schema/schema/tags";
import { Button } from "@bespoke/ui/Button";
import { Callout } from "@bespoke/ui/Callout";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { Kbd } from "@bespoke/ui/Kbd";
import { Skeleton, SkeletonScreen } from "@bespoke/ui/Skeleton";
import { Text } from "@bespoke/ui/Text";
import { toast } from "@bespoke/ui/Toast";
import { useMemo, useState, useTransition } from "react";
import { bulkUpdateTags } from "@/features/tags/api/bulkUpdateTags";
import { EditableTag } from "@/features/tags/components/EditableTag";
import { trpc } from "@/trpc/client";
import { normalizeInput, times } from "@/utils";
import { errorMessageOrFallback } from "@/utils/api";

type DraftEntry = {
	name?: string;
	deleted?: boolean;
};

type DraftMap = Map<string, DraftEntry>;

export function TagsSettings() {
	const { data: tags, isLoading } = trpc.tag.list.useQuery();

	if (tags) {
		return <TagsSettingsForm tags={tags} />;
	}

	if (isLoading) {
		return <TagsSettingsSkeleton />;
	}

	return null;
}

function TagsSettingsForm({ tags }: { tags: Tag[] }) {
	const utils = trpc.useUtils();
	const [isSaving, startTransition] = useTransition();
	const [draft, setDraft] = useState<DraftMap>(() => new Map());

	const sortedTags = useMemo(
		() => tags.toSorted((a, b) => collator.compare(a.name, b.name)),
		[tags],
	);

	const visibleTags = useMemo(
		() => sortedTags.filter((tag) => !draft.get(tag.id)?.deleted),
		[sortedTags, draft],
	);

	const validation = useMemo(() => {
		const trimmedById = new Map<string, string>();
		const counts = new Map<string, number>();

		for (const tag of sortedTags) {
			if (draft.get(tag.id)?.deleted) continue;
			const next = (draft.get(tag.id)?.name ?? tag.name).trim();
			trimmedById.set(tag.id, next);
			const key = normalizeInput(next);
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}

		const errors = new Map<string, string>();
		for (const tag of sortedTags) {
			const entry = draft.get(tag.id);
			if (entry?.deleted) continue;
			const next = trimmedById.get(tag.id) ?? "";
			const key = normalizeInput(next);
			if (next.length === 0) {
				errors.set(tag.id, "Name can't be empty");
			} else if (next.length > TAG_NAME_MAX_LENGTH) {
				errors.set(tag.id, `Max ${TAG_NAME_MAX_LENGTH} characters`);
			} else if ((counts.get(key) ?? 0) > 1 && entry?.name != null) {
				errors.set(tag.id, "Name must be unique");
			}
		}

		return { trimmedById, errors };
	}, [sortedTags, draft]);

	const pendingChanges = useMemo(() => {
		const updates: { id: string; name: string }[] = [];
		const deletes: string[] = [];

		for (const tag of tags) {
			const entry = draft.get(tag.id);
			if (!entry) continue;
			if (entry.deleted) {
				deletes.push(tag.id);
				continue;
			}
			const next = validation.trimmedById.get(tag.id);
			if (next != null && next !== tag.name) {
				updates.push({ id: tag.id, name: next });
			}
		}

		return { updates, deletes };
	}, [draft, tags, validation]);

	const isDirty =
		pendingChanges.updates.length + pendingChanges.deletes.length > 0;
	const hasErrors = validation.errors.size > 0;
	const canSave = isDirty && !hasErrors && !isSaving;

	const handleRename = (id: string, next: string) => {
		setDraft((prev) => {
			const map = new Map(prev);
			const entry = map.get(id) ?? {};
			map.set(id, { ...entry, name: next });
			return map;
		});
	};

	const handleDelete = (id: string) => {
		setDraft((prev) => {
			const map = new Map(prev);
			const entry = map.get(id) ?? {};
			map.set(id, { ...entry, deleted: true });
			return map;
		});
	};

	const handleSave = () => {
		if (!canSave) return;

		startTransition(async () => {
			try {
				const nextTags = await bulkUpdateTags(pendingChanges);
				utils.tag.list.setData(undefined, nextTags);
				utils.recipe.invalidate();
				setDraft((prev) => {
					const namesById = new Map(nextTags.map((t) => [t.id, t.name]));
					const next = new Map<string, DraftEntry>();
					for (const [id, entry] of prev) {
						const tagName = namesById.get(id);
						if (tagName == null) continue;
						if (entry.deleted) continue;
						if (entry.name != null && entry.name.trim() === tagName) continue;
						next.set(id, entry);
					}
					return next;
				});
				toast.success("Tag changes saved");
			} catch (error) {
				toast.error("Could not save tag changes", {
					description: errorMessageOrFallback(error, "Try again later."),
				});
			}
		});
	};

	return (
		<Grid gap={6}>
			{visibleTags.length === 0 ? (
				<Text as="p" size={2} light>
					{isDirty
						? "All tags are marked for deletion. Press Apply changes to confirm."
						: "No tags yet."}
				</Text>
			) : (
				<Grid gap={4}>
					<Flex as="ul" wrap gap={2} aria-label="Recipe tags">
						{visibleTags.map((tag) => {
							const entry = draft.get(tag.id);
							const name = entry?.name ?? tag.name;
							const dirty =
								entry?.name != null && entry.name.trim() !== tag.name;
							const error = validation.errors.get(tag.id);

							return (
								<li key={tag.id}>
									<EditableTag
										name={name}
										originalName={tag.name}
										dirty={dirty}
										invalid={error != null}
										invalidMessage={error}
										disabled={isSaving}
										onRename={(next) => handleRename(tag.id, next)}
										onDelete={() => handleDelete(tag.id)}
									/>
								</li>
							);
						})}
					</Flex>

					<Callout size={1} color="light" icon="circle-info" variant="solid">
						Click on tags to rename them.
					</Callout>
				</Grid>
			)}

			<Flex justifyContent="flex-end">
				<Button
					variant="solid"
					color="accent"
					size="small"
					onClick={handleSave}
					disabled={!canSave}
					aria-disabled={!canSave}
					endAdornment={<Kbd shortcut="mod+enter" variant="ghost" />}
				>
					{isSaving ? "Saving…" : "Apply changes"}
				</Button>
			</Flex>
		</Grid>
	);
}

function TagsSettingsSkeleton() {
	return (
		<SkeletonScreen>
			<Grid gap={6}>
				<Grid gap={4}>
					<Skeleton width="100%" height="2.5rem" />

					<Flex wrap gap={1}>
						{times(6).map((i) => (
							<Skeleton key={i} width="6rem" height="1.75rem" />
						))}
					</Flex>
				</Grid>

				<Skeleton width="9rem" height="2rem" />
			</Grid>
		</SkeletonScreen>
	);
}
