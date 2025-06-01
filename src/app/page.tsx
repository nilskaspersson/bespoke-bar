"use client";

import { userInputToSpec } from "@/features/specs/utils/userInputToSpec";
import styles from "./page.module.css";

export default function Home() {
	const handleSubmit = (formData: FormData) => {
		const entry = formData.get("spec");

		if (entry) {
			const spec = userInputToSpec(entry.toString());
			console.log(spec);
		}
	};

	return (
		<section className={styles.main}>
			<form action={handleSubmit}>
				<input type="text" name="spec" className={styles.input} />
			</form>
		</section>
	);
}
