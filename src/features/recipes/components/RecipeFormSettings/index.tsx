"use client";

import { usePopover } from "@/hooks/usePopover";
import { Button } from "@/ui/Button";
import { Checkbox } from "@/ui/Checkbox";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Popover } from "@/ui/Popover";
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
					label="Enable optional specs"
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
