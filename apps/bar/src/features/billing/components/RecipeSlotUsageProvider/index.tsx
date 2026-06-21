"use client";

import type { RecipeSlotUsage } from "@bespoke/api/billing/getRecipeSlotUsage";
import { createContext, type ReactNode } from "react";

export const RecipeSlotUsageContext = createContext<
	RecipeSlotUsage | undefined
>(undefined);

export function RecipeSlotUsageProvider({
	value,
	children,
}: {
	value: RecipeSlotUsage;
	children: ReactNode;
}) {
	return (
		<RecipeSlotUsageContext.Provider value={value}>
			{children}
		</RecipeSlotUsageContext.Provider>
	);
}
