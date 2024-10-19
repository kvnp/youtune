import Device from "../Device";

export default class Storage {
    static #Provider = (() => {
        if (Device.Platform == "web")
            return require("./provider/IndexedDBProvider").default;
        else if (Device.Platform == "node")
            return require("./provider/FSProvider").default;
        else
            return require("./provider/AsyncStorageProvider").default;
    })();

    static setItem(storeName: string, data: object): void {
        return this.#Provider.setItem(storeName, data);
    }

    static getItem(storeName: string, key: string) {
        return this.#Provider.getItem(storeName, key);
    }

    static deleteItem(storeName: string, key: string): void {
        return this.#Provider.deleteItem(storeName, key);
    }

    static getAllKeys(storeName: string): Array<string> {
        return this.#Provider.getAllKeys(storeName);
    }
}