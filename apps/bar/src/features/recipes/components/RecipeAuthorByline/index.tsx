import { getUserById } from "@bespoke/api/organisation/getUserById";
import type { ComponentProps } from "react";
import { FALLBACK_USER_NAME } from "@/features/organisation/constants";
import { getFullName } from "@/features/organisation/utils";
import { Skeleton } from "@/ui/Skeleton";
import { Text, type TextProps } from "@/ui/Text";
import { Time } from "@/ui/Time";
export async function RecipeAuthorByline({
	createdBy,
	createdAt,
	...props
}: TextProps & {
	createdBy: string;
	createdAt: string;
}) {
	const author = await getUserById(createdBy);

	return (
		<Text size={2} compact italic serif {...props}>
			{getFullName(author) ?? <i>{FALLBACK_USER_NAME}</i>},{" "}
			<Time date={createdAt} relativeThreshold={0} />
		</Text>
	);
}

RecipeAuthorByline.Skeleton = function RecipeAuthorBylineSkeleton(
	props: ComponentProps<typeof Skeleton>,
) {
	return <Skeleton variant="text" width="200px" height="15px" {...props} />;
};
