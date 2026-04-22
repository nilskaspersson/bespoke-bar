import Link from "next/link";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

export function CreateRecipeSlot() {
	return (
		<Link href="/bar/recipes/create" className={styles.slot}>
			<Icon name="plus" size={3} />
			Create Recipe
		</Link>
	);
}
