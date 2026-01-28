"use client";

import { useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { listViewParser, type ViewType } from "@/components/SwitchListView";

type Props = {
	defaultView?: ViewType;
	list: ReactNode;
	table: ReactNode;
};

export function RecipeViews({ defaultView = "list", list, table }: Props) {
	const [view] = useQueryState("view", listViewParser.withDefault(defaultView));

	if (view === "table") {
		return table;
	}

	return list;
}
