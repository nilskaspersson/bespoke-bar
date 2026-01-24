"use client";

import { useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { listViewParser, type ViewType } from "@/components/SwitchListView";

type Props = {
	defaultView?: ViewType;
	list: ReactNode;
	card: ReactNode;
	table: ReactNode;
};

export function RecipeViews({
	defaultView = "list",
	list,
	card,
	table,
}: Props) {
	const [view] = useQueryState("view", listViewParser.withDefault(defaultView));

	switch (view) {
		case "table":
			return table;
		case "card":
			return card;
		default:
			return list;
	}
}
