import { auth } from "@clerk/nextjs/server";
import { getIngredientMetaDataBatchWithLLM } from "@/features/ingredients/utils/getIngredientMetaDataWithLLM";
import { isAdminUser } from "@/utils/admin";

export async function GET(request: Request) {
	const { userId } = await auth();

	if (!userId) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!isAdminUser(userId)) {
		return Response.json({ error: "Forbidden" }, { status: 403 });
	}

	const { searchParams } = new URL(request.url);
	const name = searchParams.get("name");

	if (!name) {
		return Response.json(
			{ error: "Missing 'name' query param (comma-separated for multiple)" },
			{ status: 400 },
		);
	}

	const ingredientNames = name.split(",").map((n) => n.trim());
	const results = await getIngredientMetaDataBatchWithLLM(ingredientNames);

	return Response.json({
		input: ingredientNames,
		results: Object.fromEntries(results),
	});
}
