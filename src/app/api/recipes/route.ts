import { NextResponse } from "next/server";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
import { authOrForbidden } from "@/utils/auth";

export async function GET() {
	try {
		const { orgId } = await authOrForbidden();
		const lists = await getCachedBarRecipes(orgId);
		return NextResponse.json(lists);
	} catch (_e) {
		return NextResponse.json(
			{ error: "Failed to fetch recipes" },
			{ status: 500 },
		);
	}
}
