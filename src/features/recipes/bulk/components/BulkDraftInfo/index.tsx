"use client";

import { usePopover } from "@/hooks/usePopover";
import { Button } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { Icon } from "@/ui/Icon";
import { Popover } from "@/ui/Popover";
import { Text } from "@/ui/Text";
import { stopPropagation } from "@/utils/events";
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
				aria-label="Recipe editor tips"
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
