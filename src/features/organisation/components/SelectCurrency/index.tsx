import { type ComponentProps, use, useCallback, useMemo } from "react";
import { FormatterContext } from "@/hooks/useFormatter";
import { Combobox } from "@/ui/Combobox";
import { Menu } from "@/ui/Menu";
import { collator } from "@/utils/collator";
import { type Keyed, withKey } from "@/utils/withKey";
import styles from "./styles.module.css";

type Currency = {
	code: string;
	name: string;
};

const itemToString = (item: Currency | null) => (!item ? "" : item.name);
const getItemValue = (item: Currency) => item.code;

export function SelectCurrency({
	...props
}: Omit<
	ComponentProps<typeof Combobox<Currency>>,
	"items" | "itemToString" | "getItemValue" | "getItemLabel"
>) {
	const { currencyDisplayName } = use(FormatterContext);

	const getItemLabel = useCallback((item: Currency) => {
		return (
			<Menu.Label
				description={<span className={styles.code}>{item.code}</span>}
			>
				{item.name}
			</Menu.Label>
		);
	}, []);

	const options: Keyed<Currency>[] = useMemo(() => {
		const currencies = Intl.supportedValuesOf("currency");

		return currencies
			.map((code) =>
				withKey({
					code,
					name: currencyDisplayName.of(code) ?? code,
				}),
			)
			.sort((a, b) => collator.compare(a.name, b.name));
	}, [currencyDisplayName]);

	return (
		<Combobox
			items={options}
			itemToString={itemToString}
			getItemValue={getItemValue}
			getItemLabel={getItemLabel}
			{...props}
		/>
	);
}
