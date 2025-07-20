"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import type { IconName } from "@/ui/Icon/types";
import { OptionsSwitch } from "@/ui/OptionsSwitch";
import { withKey } from "@/utils/withKey";

const VIEW_TYPES = ["card", "list", "table"] as const;
export type ViewType = (typeof VIEW_TYPES)[number];

export const listViewParser =
	parseAsStringLiteral(VIEW_TYPES).withDefault("list");

const VIEW_OPTIONS = (
	[
		{
			label: "List",
			value: "list",
			icon: "list-ul",
		},
		{
			label: "Card",
			value: "card",
			icon: "memo",
		},
		{
			label: "Table",
			value: "table",
			icon: "table-list",
		},
	] satisfies {
		label: string;
		value: ViewType;
		icon: IconName;
	}[]
).map(withKey);

export function SwitchListView() {
	const [view, setView] = useQueryState("view", listViewParser);

	return (
		<OptionsSwitch
			name="view-type"
			legend="View"
			options={VIEW_OPTIONS}
			value={view}
			onChange={(e) => {
				setView(listViewParser.parse(e.target.value));
			}}
		/>
	);
}
