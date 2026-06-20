"use client";

import { createContext, type ReactNode } from "react";
import type { RecipeSlotUsage } from "@/features/billing/api/getRecipeSlotUsage";

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
