import AsyncStorage from "@react-native-async-storage/async-storage";

export default class AsyncStorageProvider {
    static #DB_NAME = "youtune-storage";

    static getItem(storeName, key) {
        return new Promise(async(resolve, reject) => {
            const value = await AsyncStorage.getItem(`${this.#DB_NAME}_${storeName}_${key}`);

            if (value !== null)
                resolve(JSON.parse(value));
            else
                resolve(null);
        });
    }

    static setItem(storeName, data) {
        const string = JSON.stringify(data);
        
        let key;
        if (storeName == "Settings")
            key = "setting";
        else if (storeName == "Artists")
            key = data["channelId"];
        else if (storeName == "Playlists")
            key = data["playlistId"];
        else if (storeName == "Tracks" || storeName == "Downloads")
            key = data["videoId"];
        else if (storeName == "Likes")
            key = data["id"];

        return AsyncStorage.setItem(`${this.#DB_NAME}_${storeName}_${key}`, string);
    }

    static deleteItem(storeName, key) {
        return AsyncStorage.removeItem(`${this.#DB_NAME}_${storeName}_${key}`);
    }

    static getAllKeys(storeName) {
        return new Promise(async(resolve, reject) => {
            let allKeys = await AsyncStorage.getAllKeys();

            let keys = [];
            for (let i = 0; i < allKeys.length; i++) {
                if (allKeys[i].includes(storeName))
                    keys.push(allKeys[i].split("_")[2]);
            }

            resolve(keys);
        });
    }
}