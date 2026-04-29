import { clsx } from "clsx";
import type { Tag } from "@/db/schema/tags";
import { Chip } from "@/ui/Chip";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

type Props = {
	tag: Tag;
	selected?: boolean;
	onClick?: () => void;
	className?: string;
};

export function RecipeTag({
	tag,
	selected = false,
	onClick,
	className,
}: Props) {
	if (onClick) {
		return (
			<Chip
				as="button"
				type="button"
				onClick={onClick}
				variant={selected ? "filled" : "outline"}
				color={selected ? "heavy" : "accent"}
				size={1}
				aria-pressed={selected}
				className={clsx(styles.tag, styles.interactive, className)}
			>
				<Icon name="tag" size={0} />
				{tag.name}
			</Chip>
		);
	}

	return (
		<Chip variant="outline" size={1} className={clsx(styles.tag, className)}>
			<Icon name="tag" size={0} />
			{tag.name}
		</Chip>
	);
}
