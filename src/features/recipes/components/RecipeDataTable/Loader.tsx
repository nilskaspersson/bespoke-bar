"use client";

import dynamic from "next/dynamic";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import type { UserIdMap } from "@/features/organisation/types";
import { RecipeDataTableSkeleton } from "./index";

const RecipeDataTable = dynamic(
	() => import("./index").then((m) => m.RecipeDataTable),
	{
		loading: RecipeDataTableSkeleton,
		ssr: false,
	},
);

type Props = {
	recipes: RecipeWithSpecs[];
	members: UserIdMap;
};

export function RecipeDataTableLoader({ recipes, members }: Props) {
	return <RecipeDataTable recipes={recipes} members={members} />;
}
