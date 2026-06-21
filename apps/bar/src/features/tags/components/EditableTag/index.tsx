"use client";

import { TAG_NAME_MAX_LENGTH } from "@bespoke/domain/tags/constants";
import { clsx } from "clsx";
import { useId } from "react";
import { usePopover } from "@/hooks/usePopover";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { Input } from "@/ui/Input";
import { Lightbox } from "@/ui/Lightbox";
import { Popover } from "@/ui/Popover";
import { Text } from "@/ui/Text";
import { handleKey } from "@/utils/keyboard";
import styles from "./styles.module.css";

type Props = {
	name: string;
	originalName: string;
	dirty?: boolean;
	invalid?: boolean;
	invalidMessage?: string;
	disabled?: boolean;
	onRename: (next: string) => void;
	onDelete: () => void;
};

export function EditableTag({
	name,
	originalName,
	dirty,
	invalid,
	invalidMessage,
	disabled,
	onRename,
	onDelete,
}: Props) {
	const popover = usePopover({ type: "auto" });
	const inputId = useId();
	const displayedName = name.trim() || originalName;

	return (
		<>
			<span
				className={clsx(styles.tag, {
					[styles.dirty]: dirty,
					[styles.invalid]: invalid,
				})}
			>
				<Button
					variant="base"
					{...popover.triggerProps}
					className={styles.rename}
					aria-label={`Rename "${displayedName}"`}
					title={`Rename "${displayedName}"`}
					disabled={disabled}
					aria-disabled={disabled}
				>
					<Icon name="tag" size={0} />
					<span>{displayedName}</span>
				</Button>

				<Button
					variant="base"
					onClick={onDelete}
					aria-label={`Delete "${displayedName}"`}
					title={`Delete "${displayedName}"`}
					className={styles.delete}
					disabled={disabled}
					aria-disabled={disabled}
				>
					<Icon name="xmark" size={0} />
				</Button>
			</span>

			<Popover
				{...popover.contentProps}
				position="bottom-start"
				className={styles.popover}
			>
				<Lightbox className={styles.surface}>
					<Input
						id={inputId}
						value={name}
						onChange={(e) => onRename(e.target.value)}
						onKeyDown={handleKey<HTMLInputElement>([
							["Enter", popover.closePopover],
						])}
						onBlur={popover.closePopover}
						maxLength={TAG_NAME_MAX_LENGTH}
						autoFocus
						autoComplete="off"
						spellCheck={false}
						aria-invalid={invalid}
						aria-describedby={invalid ? `${inputId}-error` : undefined}
						compact
						fullWidth
					/>

					{invalid && invalidMessage ? (
						<Text id={`${inputId}-error`} size={0} className={styles.error}>
							{invalidMessage}
						</Text>
					) : null}
				</Lightbox>
			</Popover>
		</>
	);
}
