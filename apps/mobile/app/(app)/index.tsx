import { getAppErrorMessage } from "@bespoke/schema/appError";
import { useQuery } from "@tanstack/react-query";
import { FlatList, Text } from "react-native";
import { getAppErrorPayload } from "../../src/trpc/appError";
import { useTRPC } from "../../src/trpc/client";

export default function RecipeList() {
	const trpc = useTRPC();
	const { data, error, isPending } = useQuery(trpc.recipe.list.queryOptions());

	if (isPending) {
		return <Text>Loading…</Text>;
	}

	if (error) {
		const payload = getAppErrorPayload(error);
		return (
			<Text style={{ color: "red" }}>
				{payload ? getAppErrorMessage(payload) : error.message}
			</Text>
		);
	}

	return (
		<FlatList
			data={data}
			keyExtractor={(recipe) => recipe.id}
			renderItem={({ item }) => <Text>{item.name}</Text>}
		/>
	);
}
