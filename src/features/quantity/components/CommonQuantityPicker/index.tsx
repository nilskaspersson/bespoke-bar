import { Flex } from "@/ui/Flex";
import { times } from "@/utils";
import styles from "./styles.module.css";

export function CommonQuantityPicker({ name }: { name: string }) {
	return (
		<fieldset className={styles.base}>
			<Flex role="radiogroup" gap={2}>
				{times(5).map((i) => {
					const optionValue = i + 1;
					const label = optionValue.toString();

					return (
						<label key={optionValue} className={styles.label}>
							<input
								type="radio"
								name={name}
								value={optionValue}
								aria-label={label}
								title={label}
								className="sr-only"
							/>

							{label}
						</label>
					);
				})}
			</Flex>
		</fieldset>
	);
}
