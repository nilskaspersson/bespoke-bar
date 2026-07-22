import { createMMKV } from "react-native-mmkv";

const queryCacheStorage = createMMKV({ id: "query-cache" });

export const offlineAuthStorage = createMMKV({ id: "offline-auth" });

export const mmkvPersisterStorage = {
	getItem(key: string) {
		return queryCacheStorage.getString(key) ?? null;
	},
	setItem(key: string, value: string) {
		queryCacheStorage.set(key, value);
	},
	removeItem(key: string) {
		queryCacheStorage.remove(key);
	},
};
