import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { Icon } from "@bespoke/ui/Icon";
import type { IconName } from "@bespoke/ui/icons/types";
import { Meter } from "@bespoke/ui/Meter";
import { Panel, type PanelProps } from "@bespoke/ui/Panel";
import { Skeleton } from "@bespoke/ui/Skeleton";
import { StatsLine } from "@bespoke/ui/StatsLine";
import { Text } from "@bespoke/ui/Text";
import { useId } from "react";
import styles from "./styles.module.css";

type Props = {
	icon: IconName;
	label: string;
	overline: string;
	used: number | undefined;
	limit: number | undefined;
};

export function UsageCard({
	icon,
	label,
	overline,
	used,
	limit,
	...props
}: Props & PanelProps) {
	const id = useId();
	const labelId = `${id}-label`;
	const valueId = `${id}-value`;

	const known = used != null && limit != null;
	const max = limit || 1;

	return (
		<Panel
			{...props}
			header={
				<Flex alignItems="center" gap={2}>
					<Icon name={icon} size={3} className={styles.icon} />

					<Text id={labelId} heavy weight={600}>
						{label}
					</Text>
				</Flex>
			}
		>
			<Grid gap={2}>
				<StatsLine id={valueId} overline={overline}>
					{known ? (
						<>
							{used}
							<Text size={2} weight={500} light>
								{" / "}
								{limit}
							</Text>
						</>
					) : (
						<Skeleton width="6ch" />
					)}
				</StatsLine>

				<Meter
					value={used ?? 0}
					max={max}
					low={max * 0.85}
					high={max - 0.5}
					optimum={0}
					aria-labelledby={`${labelId} ${valueId}`}
				/>
			</Grid>
		</Panel>
	);
}
