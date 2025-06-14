import { omit } from "@/utils";
import type { Identity } from "@/utils/types";

export const KEY_NAME = "_key";

export type WithKey<T> = T & { [KEY_NAME]: string };

export function hasKey<T extends Record<PropertyKey, unknown>>(
	o: T,
): o is WithKey<T> {
	return Object.hasOwn(o, KEY_NAME);
}

export function withKey<T extends Record<PropertyKey, unknown>>(
	o: T,
): Identity<WithKey<T>> {
	return hasKey(o) ? o : { ...o, [KEY_NAME]: crypto.randomUUID() };
}

export function withoutKey<T extends Record<PropertyKey, unknown>>(
	o: T,
): Identity<Omit<T, typeof KEY_NAME>> {
	return omit(o, KEY_NAME);
}
