"use client";

import { Button } from "@bespoke/ui/Button";
import { Callout } from "@bespoke/ui/Callout";
import { usePopover } from "@bespoke/ui/hooks/usePopover";
import { Icon } from "@bespoke/ui/Icon";
import { Popover } from "@bespoke/ui/Popover";
import { Text } from "@bespoke/ui/Text";
import { stopPropagation } from "@bespoke/ui/utils/events";
import styles from "./styles.module.css";

export function BulkDraftInfo() {
	const popover = usePopover();

	return (
		<>
			<Button
				variant="ghost"
				size="tiny"
				color="light"
				icon
				aria-label="Text editor tips"
				{...popover.triggerProps}
				onClick={stopPropagation}
			>
				<Icon name="circle-info" size={2} />
			</Button>

			<Popover
				{...popover.contentProps}
				position="top-end"
				className={styles.popover}
			>
				<Callout color="light" icon="circle-info" size={2}>
					<Text as="ul" list>
						<li>Most common units and aliases are supported.</li>
						<li>New ingredients are created automatically.</li>
						<li>Existing ingredients are matched by name.</li>
						<li>
							Create many recipes by separating each recipe with a blank line.
						</li>
					</Text>
				</Callout>
			</Popover>
		</>
	);
}
