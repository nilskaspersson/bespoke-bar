/**
 * Creates a new object without preserving the derivation history
 */
export type Identity<T> = {
	[K in keyof T]: T[K];
} & {};

export const KEY_NAME = "_key";

export type WithKey<T> = Identity<T & { [KEY_NAME]: string }>;
export type WithId<T> = Identity<T & { id: string }>;

export type Keyed<T> = WithKey<T> | WithId<T>;
