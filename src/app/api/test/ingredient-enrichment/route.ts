import { NextResponse } from "next/server";
import { getIngredientMetaDataBatchWithLLM } from "@/features/ingredients/utils/getIngredientMetaDataWithLLM";

export async function GET(request: Request) {
	if (process.env.NODE_ENV !== "development") {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const { searchParams } = new URL(request.url);
	const name = searchParams.get("name");

	if (!name) {
		return NextResponse.json(
			{ error: "Missing 'name' query param (comma-separated for multiple)" },
			{ status: 400 },
		);
	}

	const ingredientNames = name.split(",").map((n) => n.trim());
	const results = await getIngredientMetaDataBatchWithLLM(ingredientNames);

	return NextResponse.json({
		input: ingredientNames,
		results: Object.fromEntries(results),
	});
}
