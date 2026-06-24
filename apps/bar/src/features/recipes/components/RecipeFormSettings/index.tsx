"use client";

import { Button } from "@bespoke/ui/Button";
import { Checkbox } from "@bespoke/ui/Checkbox";
import { Heading } from "@bespoke/ui/Heading";
import { usePopover } from "@bespoke/ui/hooks/usePopover";
import { Icon } from "@bespoke/ui/Icon";
import { Popover } from "@bespoke/ui/Popover";
import styles from "./styles.module.css";

type Props = {
	optional: boolean;
	onOptionalChange: (value: boolean) => void;
	formId: string;
};

export function RecipeFormSettings({
	optional,
	onOptionalChange,
	formId,
}: Props) {
	const popover = usePopover();

	return (
		<>
			<Button
				{...popover.triggerProps}
				variant="clear"
				color="light"
				size="large"
				rounded
				icon
				aria-label="Form settings"
				title="Form settings"
			>
				<Icon name="sliders-horizontal" size={3} />
			</Button>

			<Popover
				{...popover.contentProps}
				position="top-overlap"
				className={styles.panel}
				role="dialog"
				aria-label="Form settings"
			>
				<Heading level="h3" size={2}>
					Form Settings
				</Heading>

				<Checkbox
					label="Enable optional lines"
					checked={optional}
					onChange={(e) => {
						onOptionalChange(e.target.checked);
					}}
				/>

				<Button
					type="reset"
					form={formId}
					variant="outline"
					color="red"
					size="small"
					className={styles.resetButton}
					onClick={() => {
						popover.closePopover();
					}}
				>
					<Icon name="arrow-rotate-left" />
					Reset form
				</Button>
			</Popover>
		</>
	);
}
